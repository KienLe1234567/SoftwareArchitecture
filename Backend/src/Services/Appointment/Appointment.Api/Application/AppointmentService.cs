﻿using Appointments.Api.Application.Interfaces;
using Appointments.Api.Domain.Entities.Appointments;
using Appointments.Api.Domain.Enums;
using MassTransit;
using Shared.Contracts;
using Shared.Exceptions;

namespace Appointments.Api.Application;

public class AppointmentService : IAppointmentService
{
    private readonly IAppointmentRepo _appointmentRepo;
    private readonly ISlotRepo _slotRepo;
    private readonly IPatientServiceClient _patientService;
    private readonly IStaffServiceClient _staffService;
    private readonly IPublishEndpoint _publishEndpoint;

    public AppointmentService(
        IAppointmentRepo appointmentRepo,
        ISlotRepo slotRepo,
        IPatientServiceClient patientService,
        IStaffServiceClient staffService,
        IPublishEndpoint publishEndpoint)
    {
        _appointmentRepo = appointmentRepo;
        _slotRepo = slotRepo;
        _patientService = patientService;
        _staffService = staffService;
        _publishEndpoint = publishEndpoint;
    }

    public async Task<List<AppointmentDetailResponse>> GetAll(Guid? doctorId, Guid? patientId, DateTime? date)
    {
        var appointments = await _appointmentRepo.GetAll();
        var filteredAppointments = appointments.Where(a =>
            (!doctorId.HasValue || a.Slot.DoctorId == doctorId) &&
            (!patientId.HasValue || a.PatientId == patientId) &&
            (!date.HasValue || a.Slot.StartTime.Date == date.Value.Date)).ToList();
        
        return filteredAppointments.Select(appointment => new AppointmentDetailResponse(
            appointment.Id,
            appointment.SlotId,
            appointment.Slot.StartTime,
            appointment.Slot.EndTime,
            appointment.Status.ToString(),
            appointment.PatientId,
            appointment.PatientName,
            appointment.Slot.DoctorId,
            appointment.DoctorName)).ToList();
    }

    public async Task<CreateAppointmentResponse> CreateAppointment(CreateAppointmentRequest req)
    {
        var slot = await _slotRepo.GetById(req.SlotId);
        if (slot is null)
        {
            throw new NotFoundException("Slot", req.SlotId.ToString());
        }

        if (slot.Status != SlotStatus.AVAILABLE)
        {
            throw new ValidationException("Slot is not available");
        }

        var patient = await _patientService.GetPatientById(req.PatientId);
        if (patient is null)
        {
            throw new NotFoundException("Patient", req.PatientId.ToString());
        }

        var doctor = await _staffService.GetStaffById(slot.DoctorId);
        if (doctor is null)
        {
            throw new NotFoundException("Doctor", slot.DoctorId.ToString());
        }

        Appointment appointment = new()
        {
            Id = Guid.NewGuid(),
            PatientId = req.PatientId,
            PatientName = $"{patient.FirstName} {patient.LastName}",
            SlotId = req.SlotId,
            DoctorName = doctor.Name,
            Status = AppointmentStatus.PENDING
        };

        _appointmentRepo.Add(appointment);
        slot.Status = SlotStatus.BOOKED;
        await _appointmentRepo.SaveChangesAsync();

        await _publishEndpoint.Publish(new AppointmentCreatedEvent(
            appointment.Id,
            appointment.PatientName,
            patient.Email,
            appointment.DoctorName,
            slot.StartTime,
            slot.EndTime
        ));

        return new CreateAppointmentResponse(appointment.Id);
    }

    public async Task<AppointmentDetailResponse> GetAppointmentById(Guid appointmentId)
    {
        var appointment = await _appointmentRepo.GetById(appointmentId);

        if (appointment is null)
        {
            throw new NotFoundException("Appointment", appointmentId.ToString());
        }

        return new AppointmentDetailResponse(
            appointmentId,
            appointment.SlotId,
            appointment.Slot.StartTime,
            appointment.Slot.EndTime,
            appointment.Status.ToString(),
            appointment.PatientId,
            appointment.PatientName,
            appointment.Slot.DoctorId,
            appointment.DoctorName);
    }

    public async Task UpdateAppointment(UpdateAppointmentRequest req)
    {
        var appointment = await _appointmentRepo.GetById(req.AppointmentId);

        if (appointment is null)
        {
            throw new NotFoundException("Appointment", req.AppointmentId.ToString());
        }

        appointment.SlotId = req.SlotId;
        appointment.PatientId = req.PatientId;
        appointment.SlotId = req.SlotId;
        appointment.Status = req.Status;

        await _appointmentRepo.SaveChangesAsync();
    }

    public async Task CancelAppointment(Guid appointmentId)
    {
        var appointment = await _appointmentRepo.GetById(appointmentId);
        if (appointment is null)
        {
            throw new NotFoundException("Appointment", appointmentId.ToString());
        }

        var patient = await _patientService.GetPatientById(appointment.PatientId);
        if (patient is null)
        {
            throw new NotFoundException("Patient", appointment.PatientId.ToString());
        }

        appointment.Status = AppointmentStatus.CANCELLED;
        appointment.Slot.Status = SlotStatus.AVAILABLE;
        await _appointmentRepo.SaveChangesAsync();

        await _publishEndpoint.Publish(new AppointmentCanceledEvent(
            appointmentId,
            appointment.PatientName,
            patient.Email,
            appointment.DoctorName,
            appointment.Slot.StartTime,
            appointment.Slot.EndTime
        ));
    }

    public async Task RescheduleAppointment(Guid appointmentId, Guid newSlotId)
    {
        var appointment = await _appointmentRepo.GetById(appointmentId);
        if (appointment is null)
        {
            throw new NotFoundException("Appointment", appointmentId.ToString());
        }

        var newSlot = await _slotRepo.GetById(newSlotId);
        if (newSlot is null)
        {
            throw new NotFoundException("Slot", newSlotId.ToString());
        }

        if (newSlot.Status != SlotStatus.AVAILABLE)
        {
            throw new ValidationException("New slot is not available");
        }

        if (appointment.Status != AppointmentStatus.PENDING)
        {
            throw new ValidationException("Cannot reschedule a confirmed, completed or cancelled appointment");
        }

        // Get updated patient and doctor information
        var patient = await _patientService.GetPatientById(appointment.PatientId);
        if (patient is null)
        {
            throw new NotFoundException("Patient", appointment.PatientId.ToString());
        }

        var doctor = await _staffService.GetStaffById(newSlot.DoctorId);
        if (doctor is null)
        {
            throw new NotFoundException("Doctor", newSlot.DoctorId.ToString());
        }

        // Update names
        appointment.PatientName = $"{patient.FirstName} {patient.LastName}";
        appointment.DoctorName = doctor.Name;

        // Update slot status
        appointment.Slot.Status = SlotStatus.AVAILABLE;
        appointment.SlotId = newSlotId;
        newSlot.Status = SlotStatus.BOOKED;

        await _appointmentRepo.SaveChangesAsync();

        // Publish the reschedule event
        await _publishEndpoint.Publish(new AppointmentRescheduleEvent(
            appointmentId,
            appointment.PatientName,
            patient.Email,
            appointment.DoctorName,
            newSlot.StartTime,
            newSlot.EndTime));
    }

    public async Task ConfirmAppointment(Guid appointmentId)
    {
        var appointment = await _appointmentRepo.GetById(appointmentId);
        if (appointment is null)
        {
            throw new NotFoundException("Appointment", appointmentId.ToString());
        }

        if (appointment.Status != AppointmentStatus.PENDING)
        {
            throw new ValidationException("Cannot confirm a completed or cancelled appointment");
        }

        var patient = await _patientService.GetPatientById(appointment.PatientId);
        if (patient is null)
        {
            throw new NotFoundException("Patient", appointment.PatientId.ToString());
        }

        appointment.Status = AppointmentStatus.CONFIRMED;
        await _appointmentRepo.SaveChangesAsync();

        await _publishEndpoint.Publish(new AppointmentConfirmedEvent(
            appointmentId,
            appointment.PatientName,
            patient.Email,
            appointment.DoctorName,
            appointment.Slot.StartTime,
            appointment.Slot.EndTime
        ));
    }

    public async Task CompleteAppointment(Guid appointmentId)
    {
        var appointment = await _appointmentRepo.GetById(appointmentId);
        if (appointment is null)
        {
            throw new NotFoundException("Appointment", appointmentId.ToString());
        }

        if (appointment.Status != AppointmentStatus.CONFIRMED)
        {
            throw new ValidationException("Cannot complete non-confirmed appointment");
        }

        var patient = await _patientService.GetPatientById(appointment.PatientId);
        if (patient is null)
        {
            throw new NotFoundException("Patient", appointment.PatientId.ToString());
        }

        appointment.Status = AppointmentStatus.COMPLETED;
        await _appointmentRepo.SaveChangesAsync();

        await _publishEndpoint.Publish(new AppointmentCompletedEvent(
            appointmentId,
            appointment.PatientName,
            patient.Email,
            appointment.DoctorName,
            appointment.Slot.StartTime,
            appointment.Slot.EndTime
        ));
    }
}

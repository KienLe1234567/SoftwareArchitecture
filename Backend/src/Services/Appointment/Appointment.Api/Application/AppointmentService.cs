using Appointments.Api.Application.Interfaces;
using Appointments.Api.Domain.Entities.Appointments;
using Appointments.Api.Domain.Enums;
using MassTransit;
using Shared.Contracts;

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
            throw new Exception("Slot not found");
        }

        if (slot.Status != SlotStatus.AVAILABLE)
        {
            throw new Exception("Slot is not available");
        }

        // Validate that patient and doctor exist and get their information
        var patient = await _patientService.GetPatientById(req.PatientId);
        if (patient is null)
        {
            throw new Exception("Patient not found");
        }

        var doctor = await _staffService.GetStaffById(slot.DoctorId);
        if (doctor is null)
        {
            throw new Exception("Doctor not found");
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

        return new CreateAppointmentResponse(appointment.Id);
    }

    public async Task<AppointmentDetailResponse> GetAppointmentById(Guid appointmentId)
    {
        var appointment = await _appointmentRepo.GetById(appointmentId);

        if (appointment is null)
        {
            throw new Exception("Appointment not found");
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
            throw new Exception("Appointment not found");
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
            throw new Exception("Appointment not found");
        }

        appointment.Status = AppointmentStatus.CANCELLED;
        appointment.Slot.Status = SlotStatus.AVAILABLE;

        await _appointmentRepo.SaveChangesAsync();
    }
    public async Task RescheduleAppointment(Guid appointmentId, Guid newSlotId)
    {
        var appointment = await _appointmentRepo.GetById(appointmentId);
        if (appointment is null)
        {
            throw new Exception("Appointment not found");
        }

        var newSlot = await _slotRepo.GetById(newSlotId);
        if (newSlot is null)
        {
            throw new Exception("New slot not found");
        }

        if (newSlot.Status != SlotStatus.AVAILABLE)
        {
            throw new Exception("New slot is not available");
        }

        if (appointment.Status != AppointmentStatus.PENDING)
        {
            throw new Exception("Cannot reschedule a confirmed, completed or cancelled appointment");
        }

        // Get updated patient and doctor information
        var patient = await _patientService.GetPatientById(appointment.PatientId);
        if (patient is null)
        {
            throw new Exception("Patient not found");
        }

        var doctor = await _staffService.GetStaffById(newSlot.DoctorId);
        if (doctor is null)
        {
            throw new Exception("Doctor not found");
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
            appointment.DoctorName,
            newSlot.StartTime,
            newSlot.EndTime));
    }

    public async Task ConfirmAppointment(Guid appointmentId)
    {
        var appointment = await _appointmentRepo.GetById(appointmentId);
        if (appointment is null)
        {
            throw new Exception("Appointment not found");
        }

        if (appointment.Status != AppointmentStatus.PENDING)
        {
            throw new Exception("Cannot confirm a completed or cancelled appointment");
        }

        appointment.Status = AppointmentStatus.CONFIRMED;

        await _appointmentRepo.SaveChangesAsync();
    }

    public async Task CompleteAppointment(Guid appointmentId)
    {
        var appointment = await _appointmentRepo.GetById(appointmentId);
        if (appointment is null)
        {
            throw new Exception("Appointment not found");
        }

        if (appointment.Status != AppointmentStatus.CONFIRMED)
        {
            throw new Exception("Cannot complete non-confirmed appointment");
        }

        appointment.Status = AppointmentStatus.COMPLETED;

        await _appointmentRepo.SaveChangesAsync();
    }
}
public class Patient
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
}

using Appointments.Api.Application.Interfaces;
using Appointments.Api.Domain.Entities.Appointments;
using Appointments.Api.Domain.Enums;

namespace Appointments.Api.Application;

public class AppointmentService(IAppointmentRepo appointmentRepo, ISlotRepo slotRepo) : IAppointmentService
{
    public async Task<CreateAppointmentResponse> CreateAppointment(CreateAppointmentRequest res)
    {
        var slot = await slotRepo.GetById(res.SlotId);
        if (slot is null)
        {
            throw new Exception("Slot not found");
        }

        if (slot.Status != SlotStatus.AVAILABLE)
        {
            throw new Exception("Slot is not available");
        }

        Appointment appointment = new()
        {
            Id = Guid.NewGuid(),
            PatientId = res.PatientId,
            SlotId = res.SlotId,
            Status = AppointmentStatus.PENDING
        };

        appointmentRepo.Add(appointment);

        appointment.Slot.Status = SlotStatus.BOOKED;

        await appointmentRepo.SaveChangesAsync();

        return new CreateAppointmentResponse(appointment.Id);
    }

    public async Task<AppointmentDetailResponse> GetAppointmentById(Guid appointmentId)
    {
        var appointment = await appointmentRepo.GetById(appointmentId);

        if (appointment is null)
        {
            throw new Exception("Appointment not found");
        }

        return new AppointmentDetailResponse(appointmentId,
                                             appointment.Slot.StartTime,
                                             appointment.Slot.EndTime,
                                             appointment.Status,
                                             appointment.PatientId);
    }

    public async Task UpdateAppointment(UpdateAppointmentRequest req)
    {
        var appointment = await appointmentRepo.GetById(req.AppointmentId);

        if (appointment is null)
        {
            throw new Exception("Appointment not found");
        }

        appointment.SlotId = req.SlotId;
        appointment.PatientId = req.PatientId;
        appointment.SlotId = req.SlotId;
        appointment.Status = req.Status;
    }

    public async Task CancelAppointment(Guid appointmentId)
    {
        var appointment = await appointmentRepo.GetById(appointmentId);

        if (appointment is null)
        {
            throw new Exception("Appointment not found");
        }

        appointment.Status = AppointmentStatus.CANCELLED;
        appointment.Slot.Status = SlotStatus.AVAILABLE;
    }
    public async Task RescheduleAppointment(Guid appointmentId, Guid newSlotId)
    {
        var appointment = await appointmentRepo.GetById(appointmentId);
        if (appointment is null)
        {
            throw new Exception("Appointment not found");
        }

        var newSlot = await slotRepo.GetById(newSlotId);
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
            throw new Exception("Cannot reschedule a completed or cancelled appointment");
        }

        appointment.Slot.Status = SlotStatus.AVAILABLE;
        appointment.SlotId = newSlotId;
        newSlot.Status = SlotStatus.BOOKED;

        await appointmentRepo.SaveChangesAsync();
    }

}

using Appointments.Api.Application.Interfaces;
using Appointments.Api.Domain.Entities.Appointments;
using Appointments.Api.Domain.Enums;

namespace Appointments.Api.Application;

public class AppointmentService(IAppointmentRepo appointmentRepo) : IAppointmentService
{
    public async Task<CreateAppointmentResponse> CreateAppointment(CreateAppointmentRequest res)
    {
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

}

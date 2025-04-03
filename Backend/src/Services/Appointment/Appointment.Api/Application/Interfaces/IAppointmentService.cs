namespace Appointments.Api.Application.Interfaces;

public interface IAppointmentService
{
    Task CreateAppointment(CreateAppointmentRequest res);
    Task<AppointmentDetailResponse> GetAppointmentById(Guid appointmentId);
    Task UpdateAppointment(UpdateAppointmentRequest res);
}

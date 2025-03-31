namespace Appointments.Api.Application.Interface;

public interface IAppointmentService
{
    Task CreateAppointment(CreateAppointmentRequest res);
    Task<AppointmentDetailResponse> GetAppointmentById(Guid appointmentId);
    Task UpdateAppointments(UpdateAppointmentRequest res);
}

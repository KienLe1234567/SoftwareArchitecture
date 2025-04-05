namespace Appointments.Api.Application.Interfaces;

public interface IAppointmentService
{
    Task<CreateAppointmentResponse> CreateAppointment(CreateAppointmentRequest res);
    Task<AppointmentDetailResponse> GetAppointmentById(Guid appointmentId);
    Task UpdateAppointment(UpdateAppointmentRequest res);
}

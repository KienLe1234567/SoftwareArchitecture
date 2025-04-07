namespace Appointments.Api.Application.Interfaces;

public interface IAppointmentService
{
    Task<List<AppointmentDetailResponse>> GetAll(Guid? doctorId, Guid? patientId, DateTime? date);
    Task<CreateAppointmentResponse> CreateAppointment(CreateAppointmentRequest res);
    Task<AppointmentDetailResponse> GetAppointmentById(Guid appointmentId);
    Task UpdateAppointment(UpdateAppointmentRequest res);
    Task CancelAppointment(Guid appointmentId);
    Task RescheduleAppointment(Guid appointmentId, Guid newSlotId);
    Task ConfirmAppointment(Guid appointmentId);
    Task CompleteAppointment(Guid appointmentId);
}

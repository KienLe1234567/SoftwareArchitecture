namespace Appointments.Api.Dtos;

public record CreateAppointmentRequest(
    DateTime StartTime,
    DateTime EndTime,
    Guid PatientId,
    Guid DoctorId
);

public record UpdateAppointmentRequest(
    Guid AppointmentId,
    DateTime StartTime,
    DateTime EndTime,
    Guid PatientId,
    Guid DoctorId
);

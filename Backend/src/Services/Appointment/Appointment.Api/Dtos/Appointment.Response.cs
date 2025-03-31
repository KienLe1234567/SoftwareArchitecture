namespace Appointments.Api.Dtos;

public record AppointmentDetailResponse(
    Guid AppointmentId,
    DateTime StartTime,
    DateTime EndTime,
    Guid PatientId,
    Guid DoctorId
);
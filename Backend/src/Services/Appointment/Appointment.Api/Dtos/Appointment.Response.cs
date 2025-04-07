using Appointments.Api.Domain.Enums;

namespace Appointments.Api.Dtos;

public record AppointmentDetailResponse(
    Guid AppointmentId,
    Guid SlotId,
    DateTime StartTime,
    DateTime EndTime,
    string Status,
    Guid PatientId,
    string PatientName,
    string PatientPhoneNumber,
    string PatientEmail
);

public record CreateAppointmentResponse(
    Guid Id);
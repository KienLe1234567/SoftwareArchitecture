using Appointments.Api.Domain.Enums;

namespace Appointments.Api.Dtos;

public record AppointmentDetailResponse(
    Guid AppointmentId,
    DateTime StartTime,
    DateTime EndTime,
    AppointmentStatus Status,
    Guid PatientId
);
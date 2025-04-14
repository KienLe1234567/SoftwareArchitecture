using Appointments.Api.Domain.Enums;

namespace Appointments.Api.Dtos;

public record CreateAppointmentRequest(
    Guid SlotId,
    Guid PatientId
);

public record UpdateAppointmentRequest(
    Guid AppointmentId,
    Guid SlotId,
    Guid PatientId,
    AppointmentStatus Status
);

public record RescheduleAppointmentRequest(
    Guid NewSlotId);
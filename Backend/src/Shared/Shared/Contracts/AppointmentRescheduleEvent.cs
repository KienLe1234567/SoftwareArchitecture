namespace Shared.Contracts;

public record AppointmentRescheduleEvent(
    Guid AppointmentId,
    string PatientName,
    string DoctorName,
    DateTime NewStartTime,
    DateTime NewEndTime);
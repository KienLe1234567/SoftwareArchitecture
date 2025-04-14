namespace Shared.Contracts;

public record AppointmentRescheduleEvent(
    Guid AppointmentId,
    string PatientName,
    string PatientEmail,
    string DoctorName,
    DateTime NewStartTime,
    DateTime NewEndTime);
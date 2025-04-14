namespace Shared.Contracts;

public record AppointmentCompletedEvent(
    Guid AppointmentId,
    string PatientName,
    string PatientEmail,
    string DoctorName,
    DateTime StartTime,
    DateTime EndTime);
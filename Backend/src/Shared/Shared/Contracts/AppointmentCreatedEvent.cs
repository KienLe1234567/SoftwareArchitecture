namespace Shared.Contracts;

public record AppointmentCreatedEvent(
    Guid AppointmentId,
    string PatientName,
    string PatientEmail,
    string DoctorName,
    DateTime StartTime,
    DateTime EndTime);
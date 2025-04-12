namespace Shared.Contracts;

public record AppointmentConfirmedEvent(
    Guid AppointmentId,
    string PatientName,
    string PatientEmail,
    string DoctorName,
    DateTime StartTime,
    DateTime EndTime);
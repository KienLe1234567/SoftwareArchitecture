namespace Shared.Contracts;

public record AppointmentCanceledEvent(
    Guid AppointmentId,
    string PatientName,
    string PatientEmail,
    string DoctorName,
    DateTime StartTime,
    DateTime EndTime,
    string CancellationReason = "");
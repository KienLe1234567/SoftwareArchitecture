namespace Shared.Contracts;
public record DoctorShiftCreatedEvent(
    Guid DoctorId,
    DateTime StartTime,
    DateTime EndTime);

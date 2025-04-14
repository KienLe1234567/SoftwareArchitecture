namespace Appointments.Api.Dtos;

public record SlotDetailResponse(
    Guid Id,
    DateTime StartTime,
    DateTime EndTime,
    string Status,
    Guid DoctorId);
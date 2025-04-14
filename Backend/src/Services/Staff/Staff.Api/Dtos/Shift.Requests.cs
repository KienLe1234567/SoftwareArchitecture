namespace Staffs.Api.Dtos;

public record CreateShiftRequest(
    Guid StaffId,
    DateTime StartTime,
    DateTime EndTime,
    string Description = "",
    string Location = "");

public record UpdateShiftRequest(
    Guid Id,
    Guid StaffId,
    DateTime StartTime,
    DateTime EndTime,
    string Description = "",
    string Location = "");
namespace Staffs.Api.Dtos;

public record CreateShiftRequest(
    Guid StaffId,
    DateTime StartTime,
    DateTime EndTime,
    string Description = "",
    string Location = "");


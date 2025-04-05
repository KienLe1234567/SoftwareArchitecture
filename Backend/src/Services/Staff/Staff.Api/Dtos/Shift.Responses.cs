namespace Staffs.Api.Dtos;

public record ShiftDetail(
    Guid Id,
    Guid StaffId,
    DateTime StartTime,
    DateTime EndTime,
    string Description,
    string Location);

public record ShiftListResponse(
    List<ShiftDetail> Shifts);

public record CreateShiftResponse(
    Guid Id);
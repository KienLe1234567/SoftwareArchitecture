namespace Staffs.Api.Dtos;

public record ShiftDetail(
    Guid Id,
    Guid StaffId,
    DateTime StartTime,
    DateTime EndTime);

public record ShiftListResponse(
    List<ShiftDetail> Shifts);
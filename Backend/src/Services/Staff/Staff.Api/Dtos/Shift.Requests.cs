namespace Staffs.Api.Dtos;

public record TimeRange(
    DateTime StartTime,
    DateTime EndTime);

public record CreateShiftsRequest(
    Guid StaffId,
    List<TimeRange> Ranges);


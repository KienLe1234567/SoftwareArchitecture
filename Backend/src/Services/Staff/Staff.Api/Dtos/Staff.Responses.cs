namespace Staffs.Api.Dtos;

public record StaffDetailResponse(
    Guid Id,
    string Name,
    string Email,
    string PhoneNumber,
    string Address,
    string StaffType
);

public record StaffListResponse(
    List<StaffDetailResponse> staffs);

public record CreateStaffResponse(
    Guid Id);
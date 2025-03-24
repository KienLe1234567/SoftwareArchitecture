namespace Staffs.Api.Dtos;

public record CreateStaffRequest(
    string Name,
    string Email,
    string PhoneNumber,
    string Address);

public record UpdateStaffRequest(
    Guid Id,
    string Name,
    string Email,
    string PhoneNumber,
    string Address);
namespace Appointments.Api.Application.Interfaces;

public interface IStaffServiceClient
{
    Task<StaffDto?> GetStaffById(Guid id);
}

public record StaffDto(
    Guid Id,
    string Name,
    string Email,
    string PhoneNumber,
    string Address);
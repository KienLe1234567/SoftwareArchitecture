namespace Staffs.Api.Dtos;

public record CreateNurseRequest(
    string Name,
    string Email,
    string PhoneNumber,
    string Address,
    string Department,
    string CertificationNumber,
    string ShiftPreference);

public record UpdateNurseRequest(
    Guid Id,
    string Name,
    string Email,
    string PhoneNumber,
    string Address,
    string Department,
    string CertificationNumber,
    string ShiftPreference);
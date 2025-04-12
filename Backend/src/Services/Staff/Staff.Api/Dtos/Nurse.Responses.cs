namespace Staffs.Api.Dtos;

public record NurseDetailResponse(
    Guid Id,
    string Name,
    string Email,
    string PhoneNumber,
    string Address,
    string Department,
    string CertificationNumber,
    string ShiftPreference);

public record NurseListResponse(
    List<NurseDetailResponse> Nurses);
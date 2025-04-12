namespace Staffs.Api.Dtos;

public record DoctorDetailResponse(
    Guid Id,
    string Name,
    string Email,
    string PhoneNumber,
    string Address,
    string Specialization,
    string LicenseNumber,
    string ConsultationRoom);

public record DoctorListResponse(
    List<DoctorDetailResponse> Doctors);
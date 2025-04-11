namespace Staffs.Api.Dtos;

public record CreateDoctorRequest(
    string Name,
    string Email,
    string PhoneNumber,
    string Address,
    string Specialization,
    string LicenseNumber,
    string ConsultationRoom);

public record UpdateDoctorRequest(
    Guid Id,
    string Name,
    string Email,
    string PhoneNumber,
    string Address,
    string Specialization,
    string LicenseNumber,
    string ConsultationRoom);
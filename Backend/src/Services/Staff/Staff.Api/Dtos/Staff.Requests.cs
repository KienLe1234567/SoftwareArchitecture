using Staffs.Api.Domain.Enums;

namespace Staffs.Api.Dtos;

public record CreateStaffRequest(
    string Name, 
    string Email, 
    string PhoneNumber, 
    string Address,
    StaffType StaffType,
    // Doctor specific fields
    string? Specialization,
    string? LicenseNumber,
    string? ConsultationRoom,
    // Nurse specific fields
    string? Department,
    string? CertificationNumber,
    string? ShiftPreference);

public record UpdateStaffRequest(
    Guid Id,
    string Name,
    string Email,
    string PhoneNumber,
    string Address);
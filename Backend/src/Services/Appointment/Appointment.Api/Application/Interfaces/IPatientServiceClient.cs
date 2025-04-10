namespace Appointments.Api.Application.Interfaces;

public interface IPatientServiceClient
{
    Task<PatientDto?> GetPatientById(Guid id);
}

public record PatientDto(
    Guid Id,
    string FirstName,
    string LastName,
    string PhoneNumber,
    string Email,
    DateTime DateOfBirth);
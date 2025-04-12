namespace Staffs.Api.Domain.Entities;

public class Nurse : Staff
{
    public required string Department { get; set; }
    public required string CertificationNumber { get; set; }
    public required string ShiftPreference { get; set; }
}
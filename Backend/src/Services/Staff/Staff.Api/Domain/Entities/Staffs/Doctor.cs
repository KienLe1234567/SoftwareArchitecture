namespace Staffs.Api.Domain.Entities;

public class Doctor : Staff
{
    public required string Specialization { get; set; }
    public required string LicenseNumber { get; set; }
    public required string ConsultationRoom { get; set; }
}
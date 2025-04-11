namespace Staffs.Api.Application.Interfaces;

public interface IDoctorRepo
{
    Task<Doctor?> GetById(Guid id);
    Task<List<Doctor>> GetAll();
    Task<List<Shift>> GetShiftsByDoctorId(Guid doctorId);
    void Add(Doctor doctor);
    void Delete(Doctor doctor);
    Task SaveChangesAsync();
}
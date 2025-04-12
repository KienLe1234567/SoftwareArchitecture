namespace Staffs.Api.Application.Interfaces;

public interface INurseRepo
{
    Task<Nurse?> GetById(Guid id);
    Task<List<Nurse>> GetAll();
    Task<List<Shift>> GetShiftsByNurseId(Guid nurseId);
    void Add(Nurse nurse);
    void Delete(Nurse nurse);
    Task SaveChangesAsync();
}
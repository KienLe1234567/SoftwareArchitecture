namespace Staffs.Api.Application.Interfaces;

public interface IStaffRepo
{
    Task<Staff?> GetById(Guid id);
    Task<List<Staff>> GetAll();
    Task<List<Shift>> GetShiftsByStaffId(Guid staffId);
    void Add(Staff staff);
    void Delete(Staff staff);
    Task SaveChangesAsync();
}

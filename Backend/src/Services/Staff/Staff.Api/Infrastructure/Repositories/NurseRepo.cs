using Microsoft.EntityFrameworkCore;
using Staffs.Api.Application.Interfaces;
using Staffs.Api.Infrastructure.Database;

namespace Staffs.Api.Infrastructure.Repositories;

public class NurseRepo : INurseRepo
{
    private readonly StaffDbContext _dbContext;

    public NurseRepo(StaffDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Nurse?> GetById(Guid id)
    {
        return await _dbContext.Nurses.Include(n => n.Shifts).FirstOrDefaultAsync(n => n.Id == id);
    }

    public async Task<List<Nurse>> GetAll()
    {
        return await _dbContext.Nurses.ToListAsync();
    }

    public async Task<List<Shift>> GetShiftsByNurseId(Guid nurseId)
    {
        return await _dbContext.Shifts.Where(s => s.StaffId == nurseId).ToListAsync();
    }

    public void Add(Nurse nurse)
    {
        _dbContext.Nurses.Add(nurse);
    }

    public void Delete(Nurse nurse)
    {
        _dbContext.Nurses.Remove(nurse);
    }

    public async Task SaveChangesAsync()
    {
        await _dbContext.SaveChangesAsync();
    }
}
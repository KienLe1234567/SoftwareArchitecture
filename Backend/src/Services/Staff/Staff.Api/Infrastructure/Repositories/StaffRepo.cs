using Microsoft.EntityFrameworkCore;
using Staffs.Api.Application.Interfaces;
using Staffs.Api.Infrastructure.Database;

namespace Staffs.Api.Infrastructure.Repositories;

public class StaffRepo(StaffDbContext dbContext) : IStaffRepo
{
    public async Task<Staff?> GetById(Guid id)
    {
        return await dbContext.Staff.Include(s => s.Shifts).Where(x => x.Id == id).FirstOrDefaultAsync();
    }

    public void Add(Staff staff)
    {
        dbContext.Staff.Add(staff);
    }

    public void Delete(Staff staff)
    {
        dbContext.Staff.Remove(staff);
    }

    public async Task<List<Staff>> GetAll()
    {
        return await dbContext.Staff.ToListAsync();
    }

    public async Task<List<Shift>> GetShiftsByStaffId(Guid staffId)
    {
        return await dbContext.Shifts.Where(x => x.StaffId == staffId).ToListAsync();
    }

    public async Task SaveChangesAsync()
    {
        await dbContext.SaveChangesAsync();
    } 
}

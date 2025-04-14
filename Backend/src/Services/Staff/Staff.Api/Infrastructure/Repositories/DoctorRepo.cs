using Microsoft.EntityFrameworkCore;
using Staffs.Api.Application.Interfaces;
using Staffs.Api.Infrastructure.Database;

namespace Staffs.Api.Infrastructure.Repositories;

public class DoctorRepo : IDoctorRepo
{
    private readonly StaffDbContext _dbContext;

    public DoctorRepo(StaffDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Doctor?> GetById(Guid id)
    {
        return await _dbContext.Doctors.Include(d => d.Shifts).FirstOrDefaultAsync(d => d.Id == id);
    }

    public async Task<List<Doctor>> GetAll()
    {
        return await _dbContext.Doctors.ToListAsync();
    }

    public async Task<List<Shift>> GetShiftsByDoctorId(Guid doctorId)
    {
        return await _dbContext.Shifts.Where(s => s.StaffId == doctorId).ToListAsync();
    }

    public void Add(Doctor doctor)
    {
        _dbContext.Doctors.Add(doctor);
    }

    public void Delete(Doctor doctor)
    {
        _dbContext.Doctors.Remove(doctor);
    }

    public async Task SaveChangesAsync()
    {
        await _dbContext.SaveChangesAsync();
    }
}
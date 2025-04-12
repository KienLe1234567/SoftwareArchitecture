using Appointments.Api.Application.Interfaces;
using Appointments.Api.Domain.Entities.Appointments;
using Appointments.Api.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace Appointments.Api.Infrastructure.Repositories;

public class AppointmentRepo : IAppointmentRepo
{
    private readonly AppointmentDbContext _context;

    public AppointmentRepo(AppointmentDbContext context)
    {
        _context = context;
    }

    public void Add(Appointment staff)
    {
        _context.Appointments.Add(staff);
    }

    public void Delete(Appointment staff)
    {
        _context.Appointments.Remove(staff);
    }

    public async Task<List<Appointment>> GetAll()
    {
        return await _context.Appointments.Include(x => x.Slot).AsNoTracking().ToListAsync();
    }

    public async Task<Appointment?> GetById(Guid id)
    {
        return await _context.Appointments.Include(x => x.Slot).FirstOrDefaultAsync(x => x.Id == id);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}

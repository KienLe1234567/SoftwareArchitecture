using Appointments.Api.Application.Interfaces;
using Appointments.Api.Domain.Entities.TimeSlots;
using Appointments.Api.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace Appointments.Api.Infrastructure.Repositories;

public class SlotRepo(AppointmentDbContext dbContext) : ISlotRepo
{
    public async Task<TimeSlot?> GetById(Guid slotId)
    {
        return await dbContext.Slots.Where(x => x.Id == slotId).FirstOrDefaultAsync();
    }

    public async Task<List<TimeSlot>> GetByDoctorIdAndDate(Guid doctorId, DateTime time)
    {
        return await dbContext.Slots
            .Where(x => x.DoctorId == doctorId && x.StartTime.Date == time.Date)
            .ToListAsync();
    }
}

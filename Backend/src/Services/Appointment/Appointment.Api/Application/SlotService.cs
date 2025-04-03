using Appointments.Api.Application.Interfaces;
using Appointments.Api.Domain.Entities.TimeSlots;

namespace Appointments.Api.Application;

public class SlotService(ISlotRepo slotRepo) : ISlotService
{
    public async Task<TimeSlot> GetSlotById(Guid slotId)
    {
        var slot = await slotRepo.GetById(slotId);
        if (slot is null)
        {
            throw new Exception("Slot not found");
        }

        return slot;
    }

    public async Task<List<TimeSlot>> GetSlotsByDoctorIdAndDate(Guid doctorId, DateTime date)
    {
        return await slotRepo.GetByDoctorIdAndDate(doctorId, date);
    }
}

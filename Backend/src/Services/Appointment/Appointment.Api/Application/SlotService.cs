using Appointments.Api.Application.Interfaces;
using Appointments.Api.Domain.Entities.TimeSlots;
using Appointments.Api.Domain.Enums;

namespace Appointments.Api.Application;

public class SlotService(ISlotRepo slotRepo) : ISlotService
{
    public const int SlotSpan = 30; // in minutes
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
    
    public async Task CreateSlots(Guid doctorId, DateTime startTime, DateTime endTime)
    {
        var timeSlots = new List<TimeSlot>();

        // Ensure endTime is after startTime
        if (endTime <= startTime)
        {
            throw new ArgumentException("EndTime must be greater than StartTime");
        }

        DateTime currentStartTime = startTime;

        while (currentStartTime < endTime)
        {
            DateTime slotEndTime = currentStartTime.AddMinutes(SlotSpan);

            if (slotEndTime > endTime)
            {
                slotEndTime = endTime;
            }

            var timeSlot = new TimeSlot
            {
                Id = Guid.NewGuid(),
                StartTime = currentStartTime,
                EndTime = slotEndTime,
                DoctorId = doctorId,
                Status = SlotStatus.AVAILABLE
            };

            timeSlots.Add(timeSlot);

            currentStartTime = slotEndTime;
        }

        slotRepo.AddRange(timeSlots);

        await slotRepo.SaveChangesAsync();

        return;
    }
}

using Appointments.Api.Application.Interfaces;
using Appointments.Api.Domain.Entities.TimeSlots;
using Appointments.Api.Domain.Enums;
using MassTransit.Initializers;
using MassTransit.NewIdProviders;

namespace Appointments.Api.Application;

public class SlotService(ISlotRepo slotRepo) : ISlotService
{
    public const int SlotSpan = 30; // in minutes
    public async Task<SlotDetailResponse> GetSlotById(Guid slotId)
    {
        var slot = await slotRepo.GetById(slotId);
        if (slot is null)
        {
            throw new Exception("Slot not found");
        }

        return new SlotDetailResponse(slot.Id, slot.StartTime, slot.EndTime, slot.Status.ToString(), slot.DoctorId);
    }

    public async Task<List<SlotDetailResponse>> GetSlotsByDoctorIdAndDate(Guid doctorId, DateTime date)
    {
        return (await slotRepo.GetByDoctorIdAndDate(doctorId, date)).Select(s => new SlotDetailResponse(s.Id, s.StartTime, s.EndTime, s.Status.ToString(), s.DoctorId)).ToList();
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

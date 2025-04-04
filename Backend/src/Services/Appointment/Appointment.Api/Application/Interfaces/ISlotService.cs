using Appointments.Api.Domain.Entities.TimeSlots;

namespace Appointments.Api.Application.Interfaces;

public interface ISlotService
{
    Task<List<TimeSlot>> GetSlotsByDoctorIdAndDate(Guid doctorId, DateTime date);
    Task<TimeSlot> GetSlotById(Guid slotId);
    Task CreateSlots(Guid doctorId, DateTime StartTime, DateTime EndTime);
}

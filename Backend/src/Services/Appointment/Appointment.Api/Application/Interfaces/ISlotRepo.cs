using Appointments.Api.Domain.Entities.TimeSlots;

namespace Appointments.Api.Application.Interfaces;

public interface ISlotRepo
{
    Task<TimeSlot?> GetById(Guid slotId);
    Task<List<TimeSlot>> GetByDoctorIdAndDate(Guid staffId, DateTime time);
    void AddRange(List<TimeSlot> slots);
    Task SaveChangesAsync();
}

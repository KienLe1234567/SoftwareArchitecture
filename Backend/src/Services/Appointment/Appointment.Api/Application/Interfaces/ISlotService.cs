using Appointments.Api.Domain.Entities.TimeSlots;

namespace Appointments.Api.Application.Interfaces;

public interface ISlotService
{
    Task<List<SlotDetailResponse>> GetSlotsByDoctorIdAndDate(Guid doctorId, DateTime date);
    Task<SlotDetailResponse> GetSlotById(Guid slotId);
    Task CreateSlots(Guid doctorId, DateTime StartTime, DateTime EndTime);
}

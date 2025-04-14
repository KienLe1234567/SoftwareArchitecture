using Appointments.Api.Domain.Enums;

namespace Appointments.Api.Domain.Entities.TimeSlots;

public class TimeSlot
{
    public Guid Id { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public Guid DoctorId { get; set; }
    public SlotStatus Status { get; set; }
}

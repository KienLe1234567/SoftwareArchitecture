using Appointments.Api.Domain.Entities.TimeSlots;
using Appointments.Api.Domain.Enums;

namespace Appointments.Api.Domain.Entities.Appointments;

public class Appointment
{
    public Guid Id { get; set; }
    public Guid PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public Guid SlotId { get; set; }
    public TimeSlot Slot { get; set; } = default!;
    public string DoctorName { get; set; } = string.Empty;
    public AppointmentStatus Status { get; set; }
}
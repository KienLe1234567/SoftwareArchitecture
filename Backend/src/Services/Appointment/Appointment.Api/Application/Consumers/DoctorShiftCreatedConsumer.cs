using Appointments.Api.Application.Interfaces;
using MassTransit;
using Shared.Contracts;

namespace Appointments.Api.Application.Consumers;

public class DoctorShiftCreatedConsumer(ISlotService slotService) : IConsumer<DoctorShiftCreatedEvent>
{
    public async Task Consume(ConsumeContext<DoctorShiftCreatedEvent> context)
    {
        await slotService.CreateSlots(
            context.Message.DoctorId,
            context.Message.StartTime,
            context.Message.EndTime
        );
    }
}

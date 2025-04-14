using Appointments.Api.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Appointments.Api.Controllers;

[Route("api/slots")]
public class SlotController(ISlotService slotService) : ControllerBase
{
    [HttpGet("{slotId:guid}")]
    public async Task<IResult> GetById([FromRoute] Guid slotId)
    {
        var slot = await slotService.GetSlotById(slotId);

        return Results.Ok(slot);
    }

    [HttpGet("")]
    public async Task<IResult> GetByDoctorIdAndDate([FromQuery] Guid doctorId, [FromQuery] DateTime date)
    {
        if (doctorId == Guid.Empty || date == DateTime.MinValue)
        {
            return Results.BadRequest();
        }

        var slots = await slotService.GetSlotsByDoctorIdAndDate(doctorId, date);

        return Results.Ok(slots);
    }
}

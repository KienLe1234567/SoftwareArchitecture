using Appointments.Api.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Appointments.Api.Controllers;

[Route("api/appointments")]
public class AppointmentController(IAppointmentService appointmentService) : ControllerBase
{

    [HttpPost]
    public async Task<IResult> Create([FromBody] CreateAppointmentRequest req)
    {
        var id = await appointmentService.CreateAppointment(req);

        return Results.Created($"api/appointments/{id}", id);
    }

    [HttpGet("{appointmentId:guid}")]
    public async Task<IResult> GetById([FromRoute] Guid appointmentId)
    {
        var appointment = await appointmentService.GetAppointmentById(appointmentId);

        return Results.Ok(appointment);
    }

    [HttpPut("{appointmentId:guid}")]
    public async Task<IResult> Update([FromRoute] Guid appointmentId, [FromBody] UpdateAppointmentRequest req)
    {
        var appointment = req with { AppointmentId = appointmentId };
        await appointmentService.UpdateAppointment(appointment);

        return Results.NoContent();
    }
}

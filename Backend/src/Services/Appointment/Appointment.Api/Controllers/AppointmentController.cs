﻿using Appointments.Api.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Appointments.Api.Controllers;

[Route("api/appointments")]
public class AppointmentController(IAppointmentService appointmentService) : ControllerBase
{

    [HttpPost]
    public async Task<IResult> Create([FromBody] CreateAppointmentRequest req)
    {
        var res = await appointmentService.CreateAppointment(req);

        return Results.Created($"api/appointments/{res.Id}", res);
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

    [HttpPost("{appointmentId:guid}/cancel")]
    public async Task<IResult> Cancel([FromRoute] Guid appointmentId)
    {
        await appointmentService.CancelAppointment(appointmentId);

        return Results.NoContent();
    }

    [HttpPost("{appointmentId:guid}/reschedule")]
    public async Task<IResult> Reschedule([FromRoute] Guid appointmentId, [FromBody] RescheduleAppointmentRequest req)
    {
        await appointmentService.RescheduleAppointment(appointmentId, req.NewSlotId);

        return Results.NoContent();
    }
}

using Microsoft.AspNetCore.Mvc;
using Staffs.Api.Application.Interfaces;
using Staffs.Api.Dtos;

namespace Staffs.Api.Controllers;

[Route("api/doctors")]
public class DoctorController(IDoctorService doctorService) : ControllerBase
{
    [HttpGet("{doctorId:guid}")]
    public async Task<IResult> GetById([FromRoute] Guid doctorId)
    {
        var doctor = await doctorService.GetById(doctorId);
        return Results.Ok(doctor);
    }

    [HttpGet]
    public async Task<IResult> GetAll()
    {
        var doctors = await doctorService.GetAll();
        return Results.Ok(doctors);
    }

    [HttpPost]
    public async Task<IResult> Create([FromBody] CreateDoctorRequest req)
    {
        var res = await doctorService.RegisterDoctor(req);
        return Results.Created($"/api/doctors/{res.Id}", res);
    }

    [HttpPut("{doctorId:guid}")]
    public async Task<IResult> Update([FromRoute] Guid doctorId, [FromBody] UpdateDoctorRequest req)
    {
        var doctor = req with { Id = doctorId };
        await doctorService.UpdateDoctor(doctor);
        return Results.NoContent();
    }

    [HttpDelete("{doctorId:guid}")]
    public async Task<IResult> Delete([FromRoute] Guid doctorId)
    {
        await doctorService.DeleteDoctor(doctorId);
        return Results.NoContent();
    }
}
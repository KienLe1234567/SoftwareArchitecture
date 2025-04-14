using Microsoft.AspNetCore.Mvc;
using Staffs.Api.Application.Interfaces;
using Staffs.Api.Dtos;

namespace Staffs.Api.Controllers;

[Route("api/nurses")]
public class NurseController(INurseService nurseService) : ControllerBase
{
    [HttpGet("{nurseId:guid}")]
    public async Task<IResult> GetById([FromRoute] Guid nurseId)
    {
        var nurse = await nurseService.GetById(nurseId);
        return Results.Ok(nurse);
    }

    [HttpGet]
    public async Task<IResult> GetAll()
    {
        var nurses = await nurseService.GetAll();
        return Results.Ok(nurses);
    }

    [HttpPost]
    public async Task<IResult> Create([FromBody] CreateNurseRequest req)
    {
        var res = await nurseService.RegisterNurse(req);
        return Results.Created($"/api/nurses/{res.Id}", res);
    }

    [HttpPut("{nurseId:guid}")]
    public async Task<IResult> Update([FromRoute] Guid nurseId, [FromBody] UpdateNurseRequest req)
    {
        var nurse = req with { Id = nurseId };
        await nurseService.UpdateNurse(nurse);
        return Results.NoContent();
    }

    [HttpDelete("{nurseId:guid}")]
    public async Task<IResult> Delete([FromRoute] Guid nurseId)
    {
        await nurseService.DeleteNurse(nurseId);
        return Results.NoContent();
    }
}
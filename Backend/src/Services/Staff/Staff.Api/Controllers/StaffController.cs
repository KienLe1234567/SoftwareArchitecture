using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Staffs.Api.Application.Interfaces;

namespace Staffs.Api.Controllers;

[Route("api/staffs")]
public class StaffController(
    IStaffService staffService) : ControllerBase
{
    [HttpGet("{staffId:guid}")]
    public async Task<IResult> GetById([FromRoute] Guid staffId)
    {
        var staff = await staffService.GetById(staffId);

        return Results.Ok(staff);
    }

    [HttpGet]
    public async Task<IResult> GetAll()
    {
        var staffs = await staffService.GetAll();

        return Results.Ok(staffs);
    }

    [HttpPost]
    public async Task<IResult> Create([FromBody] CreateStaffRequest req)
    {
        var id = await staffService.RegisterStaff(req);

        return Results.Created($"/api/staffs/{id}", id);
    }

    [HttpPut("{staffId:guid}")]
    public async Task<IResult> Update([FromRoute] Guid staffId, [FromBody] UpdateStaffRequest req)
    {
        var staff = req with { Id = staffId };
        await staffService.UpdateStaff(staff);

        return Results.NoContent();
    }

    [HttpDelete("{staffId:guid}")]
    public async Task<IResult> Delete([FromRoute] Guid staffId)
    {
        await staffService.DeleteStaff(staffId);

        return Results.NoContent();
    }

    [HttpGet("{staffId:guid}/shifts")]
    public async Task<IResult> GetStaffShifts([FromRoute] Guid staffId)
    {
        var shifts = await staffService.GetStaffShifts(staffId);

        return Results.Ok(shifts);
    }

    [HttpPost("{staffId:guid}/shifts")]
    public async Task<IResult> RegisterShift([FromRoute] Guid staffId, [FromBody] CreateShiftRequest req)
    {
        var shift = req with { StaffId = staffId };
        var id = await staffService.RegisterShift(shift);

        return Results.Created($"/api/staffs/{staffId}/shifts/{id}", id);
    }

    [HttpPut("{staffId:guid}/shifts/{shiftId:guid}")]
    public async Task<IResult> UpdateShift([FromRoute] Guid staffId, [FromRoute] Guid shiftId, [FromBody] UpdateShiftRequest req)
    {
        var shift = req with { Id = shiftId, StaffId = staffId };
        await staffService.UpdateShift(shift);

        return Results.NoContent();
    }

    [HttpDelete("{staffId:guid}/shifts/{shiftId:guid}")]
    public async Task<IResult> DeleteShift([FromRoute] Guid staffId, [FromRoute] Guid shiftId)
    {
        await staffService.DeleteShift(staffId, shiftId);

        return Results.NoContent();
    }
}

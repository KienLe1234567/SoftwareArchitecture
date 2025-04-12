using MassTransit;
using Shared.Contracts;
using Shared.Exceptions;
using Staffs.Api.Application.Interfaces;
using Staffs.Api.Domain.Enums;

namespace Staffs.Api.Application;

public class ShiftService(
    IStaffRepo staffRepo,
    IPublishEndpoint publishEndpoint) : IShiftService
{
    public async Task<ShiftListResponse> GetStaffShifts(Guid staffId)
    {
        var shifts = await staffRepo.GetShiftsByStaffId(staffId);

        return new ShiftListResponse(shifts.Select(s => new ShiftDetail(s.Id, s.StaffId, s.StartTime, s.EndTime, s.Description, s.Location)).ToList());
    }

    public async Task<CreateShiftResponse> RegisterShift(CreateShiftRequest req)
    {
        var staff = await staffRepo.GetById(req.StaffId);
        if (staff is null)
        {
            throw new NotFoundException("Staff", req.StaffId.ToString());
        }

        if (staff.Shifts.Any(s => s.StartTime <= req.EndTime && s.EndTime >= req.StartTime))
        {
            throw new ValidationException("Shift time conflict");
        }

        var shift = new Shift
        {
            StaffId = req.StaffId,
            StartTime = req.StartTime,
            EndTime = req.EndTime,
            Description = req.Description,
            Location = req.Location
        };

        staff.RegisterShift(shift);
        await staffRepo.SaveChangesAsync();

        if (staff.Type == StaffType.Doctor)
        {
            await publishEndpoint.Publish(new DoctorShiftCreatedEvent(
                staff.Id,
                shift.StartTime,
                shift.EndTime));
        }

        return new CreateShiftResponse(shift.Id);
    }

    public async Task UpdateShift(UpdateShiftRequest req)
    {
        var staff = await staffRepo.GetById(req.StaffId);
        if (staff is null)
        {
            throw new NotFoundException("Staff", req.StaffId.ToString());
        }

        var shift = staff.Shifts.FirstOrDefault(s => s.Id == req.Id);
        if (shift is null)
        {
            throw new NotFoundException("Shift", req.Id.ToString());
        }

        if (staff.Shifts.Any(s => s.Id != req.Id && s.StartTime <= req.EndTime && s.EndTime >= req.StartTime))
        {
            throw new ValidationException("Shift time conflict");
        }

        shift.StartTime = req.StartTime;
        shift.EndTime = req.EndTime;
        shift.Description = req.Description;
        shift.Location = req.Location;

        await staffRepo.SaveChangesAsync();
    }

    public async Task DeleteShift(Guid staffId, Guid shiftId)
    {
        var staff = await staffRepo.GetById(staffId);
        if (staff is null)
        {
            throw new NotFoundException("Staff", staffId.ToString());
        }

        var shift = staff.Shifts.FirstOrDefault(s => s.Id == shiftId);
        if (shift is null)
        {
            throw new NotFoundException("Shift", shiftId.ToString());
        }

        staff.Shifts.Remove(shift);
        await staffRepo.SaveChangesAsync();
    }
}
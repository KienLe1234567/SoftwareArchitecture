using MassTransit;
using Shared.Contracts;
using Staffs.Api.Application.Interfaces;

namespace Staffs.Api.Application;

public class StaffService(
    IStaffRepo staffRepo,
    IPublishEndpoint publishEndpoint) : IStaffService
{
    public async Task<StaffDetailResponse> GetById(Guid id)
    {
       var staff = await staffRepo.GetById(id);
        if (staff is null)
        {
            throw new Exception("Staff not found");
        }

        return new StaffDetailResponse(staff.Id, staff.Name, staff.Email, staff.PhoneNumber, staff.Address);
    }

    public async Task<StaffListResponse> GetAll()
    {
        var staffs = await staffRepo.GetAll();
        return new StaffListResponse(staffs.Select(x => new StaffDetailResponse(x.Id, x.Name, x.Email, x.PhoneNumber, x.Address)).ToList());
    }

    public async Task<CreateStaffResponse> RegisterStaff(CreateStaffRequest req)
    {
        Staff newStaff = new()
        {
            Name = req.Name,
            Email = req.Email,
            PhoneNumber = req.PhoneNumber,
            Address = req.Address
        };

        staffRepo.Add(newStaff);
        await staffRepo.SaveChangesAsync();

        return new CreateStaffResponse(newStaff.Id);
    }

    public async Task DeleteStaff(Guid id)
    {
        var staff = await staffRepo.GetById(id);
        if (staff is null)
        {
            throw new Exception("Staff not found");
        }

        staffRepo.Delete(staff);
        await staffRepo.SaveChangesAsync();
    }

    public async Task UpdateStaff(UpdateStaffRequest req)
    {
        var staff = await staffRepo.GetById(req.Id);
        if (staff is null)
        {
            throw new Exception("Staff not found");
        }

        staff.Update(req.Name, req.Email, req.PhoneNumber, req.Address);
        await staffRepo.SaveChangesAsync();
    }

    public async Task<CreateShiftResponse> RegisterShift(CreateShiftRequest req)
    {
        var staff = await staffRepo.GetById(req.StaffId);
        if (staff is null)
        {
            throw new Exception("Staff not found");
        }

        if (staff.Shifts.Any(s => s.StartTime <= req.EndTime && s.EndTime >= req.StartTime))
        {
            throw new Exception("Shift time conflict");
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

        await publishEndpoint.Publish(new DoctorShiftCreatedEvent(
            staff.Id,
            shift.StartTime,
            shift.EndTime));

        return new CreateShiftResponse(shift.Id);
    }

    public async Task<ShiftListResponse> GetStaffShifts(Guid staffId)
    {
        var shifts = await staffRepo.GetShiftsByStaffId(staffId);

        return new ShiftListResponse(shifts.Select(s => new ShiftDetail(s.Id, s.StaffId, s.StartTime, s.EndTime, s.Description, s.Location)).ToList());
    }

    public async Task UpdateShift(UpdateShiftRequest req)
    {
        var staff = await staffRepo.GetById(req.StaffId);
        if (staff is null)
        {
            throw new Exception("Staff not found");
        }

        var shift = staff.Shifts.Where(s => s.Id == req.Id).FirstOrDefault();

        if (shift is null)
        {
            throw new Exception("Shift not found");
        }

        if (staff.Shifts.Any(s => s.Id != req.Id && s.StartTime <= req.EndTime && s.EndTime >= req.StartTime))
        {
            throw new Exception("Shift time conflict");
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
            throw new Exception("Staff not found");
        }

        var shift = staff.Shifts.Where(s => s.Id == shiftId).FirstOrDefault();

        if (shift is null)
        {
            throw new Exception("Shift not found");
        }

        staff.Shifts.Remove(shift);
        await staffRepo.SaveChangesAsync();

    }
}

using Staffs.Api.Application.Interfaces;

namespace Staffs.Api.Application;

public class StaffService(
    IStaffRepo staffRepo) : IStaffService
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

    public async Task RegisterStaff(CreateStaffRequest req)
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

    public async Task RegisterShift(CreateShiftsRequest req)
    {
        var staff = await staffRepo.GetById(req.StaffId);
        if (staff is null)
        {
            throw new Exception("Staff not found");
        }

        var shifts = req.Ranges.Select(x => new Shift
        {
            StaffId = req.StaffId,
            StartTime = x.StartTime,
            EndTime = x.EndTime
        }).ToList();

        staff.RegisterShifts(shifts);
        await staffRepo.SaveChangesAsync();
    }

    public async Task<ShiftListResponse> GetStaffShifts(Guid staffId)
    {
        var shifts = await staffRepo.GetShiftsByStaffId(staffId);

        return new ShiftListResponse(shifts.Select(s => new ShiftDetail(s.Id, s.StaffId, s.StartTime, s.EndTime)).ToList());
    }
}

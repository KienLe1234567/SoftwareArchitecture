using MassTransit;
using Shared.Contracts;
using Shared.Exceptions;
using Staffs.Api.Application.Interfaces;
using Staffs.Api.Domain.Enums;

namespace Staffs.Api.Application;

public class StaffService(
    IStaffRepo staffRepo) : IStaffService
{
    public async Task<StaffDetailResponse> GetById(Guid id)
    {
        var staff = await staffRepo.GetById(id);
        if (staff is null)
        {
            throw new NotFoundException("Staff", id.ToString());
        }

        return new StaffDetailResponse(staff.Id, staff.Name, staff.Email, staff.PhoneNumber, staff.Address, staff.Type.ToString());
    }

    public async Task<StaffListResponse> GetAll()
    {
        var staffs = await staffRepo.GetAll();
        return new StaffListResponse(staffs.Select(x => new StaffDetailResponse(x.Id, x.Name, x.Email, x.PhoneNumber, x.Address, x.Type.ToString())).ToList());
    }

    public async Task DeleteStaff(Guid id)
    {
        var staff = await staffRepo.GetById(id);
        if (staff is null)
        {
            throw new NotFoundException("Staff", id.ToString());
        }

        staffRepo.Delete(staff);
        await staffRepo.SaveChangesAsync();
    }
}

namespace Staffs.Api.Application.Interfaces;

public interface IStaffService
{
    Task<StaffDetailResponse> GetById(Guid id);
    Task<StaffListResponse> GetAll();
    Task RegisterStaff(CreateStaffRequest req);
    Task UpdateStaff(UpdateStaffRequest req);
    Task DeleteStaff(Guid id);
    Task<ShiftListResponse> GetStaffShifts(Guid staffId);
    Task RegisterShift(CreateShiftsRequest req);
}

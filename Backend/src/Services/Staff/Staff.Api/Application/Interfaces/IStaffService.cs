namespace Staffs.Api.Application.Interfaces;

public interface IStaffService
{
    Task<StaffDetailResponse> GetById(Guid id);
    Task<StaffListResponse> GetAll();
    Task DeleteStaff(Guid id);
    Task<ShiftListResponse> GetStaffShifts(Guid staffId);
    Task<CreateShiftResponse> RegisterShift(CreateShiftRequest req);
    Task UpdateShift(UpdateShiftRequest req);
    Task DeleteShift(Guid staffId, Guid shiftId);
}

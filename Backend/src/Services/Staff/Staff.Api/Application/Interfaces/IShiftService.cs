namespace Staffs.Api.Application.Interfaces;

public interface IShiftService
{
    Task<ShiftListResponse> GetStaffShifts(Guid staffId);
    Task<CreateShiftResponse> RegisterShift(CreateShiftRequest req);
    Task UpdateShift(UpdateShiftRequest req);
    Task DeleteShift(Guid staffId, Guid shiftId);
}
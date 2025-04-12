namespace Staffs.Api.Application.Interfaces;

public interface IStaffService
{
    Task<StaffDetailResponse> GetById(Guid id);
    Task<StaffListResponse> GetAll();
    Task DeleteStaff(Guid id);
}

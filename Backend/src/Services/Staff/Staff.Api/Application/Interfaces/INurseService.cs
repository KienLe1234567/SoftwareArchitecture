using Staffs.Api.Dtos;

namespace Staffs.Api.Application.Interfaces;

public interface INurseService
{
    Task<NurseDetailResponse> GetById(Guid id);
    Task<NurseListResponse> GetAll();
    Task<CreateStaffResponse> RegisterNurse(CreateNurseRequest req);
    Task UpdateNurse(UpdateNurseRequest req);
    Task DeleteNurse(Guid id);
}
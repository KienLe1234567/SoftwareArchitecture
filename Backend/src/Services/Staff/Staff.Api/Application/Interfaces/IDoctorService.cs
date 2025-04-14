using Staffs.Api.Dtos;

namespace Staffs.Api.Application.Interfaces;

public interface IDoctorService
{
    Task<DoctorDetailResponse> GetById(Guid id);
    Task<DoctorListResponse> GetAll();
    Task<CreateStaffResponse> RegisterDoctor(CreateDoctorRequest req);
    Task UpdateDoctor(UpdateDoctorRequest req);
    Task DeleteDoctor(Guid id);
}
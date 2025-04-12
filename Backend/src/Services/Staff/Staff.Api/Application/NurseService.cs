using MassTransit;
using Shared.Exceptions;
using Staffs.Api.Application.Interfaces;
using Staffs.Api.Domain.Enums;
using Staffs.Api.Dtos;

namespace Staffs.Api.Application;

public class NurseService : INurseService
{
    private readonly INurseRepo _nurseRepo;
    private readonly IPublishEndpoint _publishEndpoint;

    public NurseService(INurseRepo nurseRepo, IPublishEndpoint publishEndpoint)
    {
        _nurseRepo = nurseRepo;
        _publishEndpoint = publishEndpoint;
    }

    public async Task<NurseDetailResponse> GetById(Guid id)
    {
        var nurse = await _nurseRepo.GetById(id);
        if (nurse is null)
        {
            throw new NotFoundException("Nurse", id.ToString());
        }

        return new NurseDetailResponse(
            nurse.Id, 
            nurse.Name, 
            nurse.Email, 
            nurse.PhoneNumber, 
            nurse.Address,
            nurse.Department,
            nurse.CertificationNumber,
            nurse.ShiftPreference);
    }

    public async Task<NurseListResponse> GetAll()
    {
        var nurses = await _nurseRepo.GetAll();
        var nurseResponses = nurses.Select(n => 
            new NurseDetailResponse(
                n.Id, 
                n.Name, 
                n.Email, 
                n.PhoneNumber, 
                n.Address,
                n.Department,
                n.CertificationNumber,
                n.ShiftPreference)).ToList();
        return new NurseListResponse(nurseResponses);
    }

    public async Task<CreateStaffResponse> RegisterNurse(CreateNurseRequest req)
    {
        var nurse = new Nurse
        {
            Type = StaffType.Nurse,
            Name = req.Name,
            Email = req.Email,
            PhoneNumber = req.PhoneNumber,
            Address = req.Address,
            Department = req.Department,
            CertificationNumber = req.CertificationNumber,
            ShiftPreference = req.ShiftPreference
        };

        _nurseRepo.Add(nurse);
        await _nurseRepo.SaveChangesAsync();

        return new CreateStaffResponse(nurse.Id);
    }

    public async Task UpdateNurse(UpdateNurseRequest req)
    {
        var nurse = await _nurseRepo.GetById(req.Id);
        if (nurse is null)
        {
            throw new NotFoundException("Nurse", req.Id.ToString());
        }

        nurse.Update(req.Name, req.Email, req.PhoneNumber, req.Address);
        nurse.Department = req.Department;
        nurse.CertificationNumber = req.CertificationNumber;
        nurse.ShiftPreference = req.ShiftPreference;

        await _nurseRepo.SaveChangesAsync();
    }

    public async Task DeleteNurse(Guid id)
    {
        var nurse = await _nurseRepo.GetById(id);
        if (nurse is null)
        {
            throw new NotFoundException("Nurse", id.ToString());
        }

        _nurseRepo.Delete(nurse);
        await _nurseRepo.SaveChangesAsync();
    }
}
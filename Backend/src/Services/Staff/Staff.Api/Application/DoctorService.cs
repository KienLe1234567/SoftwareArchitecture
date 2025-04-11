using MassTransit;
using Shared.Contracts;
using Shared.Exceptions;
using Staffs.Api.Application.Interfaces;
using Staffs.Api.Domain.Enums;
using Staffs.Api.Dtos;

namespace Staffs.Api.Application;

public class DoctorService : IDoctorService
{
    private readonly IDoctorRepo _doctorRepo;
    private readonly IPublishEndpoint _publishEndpoint;

    public DoctorService(IDoctorRepo doctorRepo, IPublishEndpoint publishEndpoint)
    {
        _doctorRepo = doctorRepo;
        _publishEndpoint = publishEndpoint;
    }

    public async Task<DoctorDetailResponse> GetById(Guid id)
    {
        var doctor = await _doctorRepo.GetById(id);
        if (doctor is null)
        {
            throw new NotFoundException("Doctor", id.ToString());
        }

        return new DoctorDetailResponse(
            doctor.Id, 
            doctor.Name, 
            doctor.Email, 
            doctor.PhoneNumber, 
            doctor.Address,
            doctor.Specialization,
            doctor.LicenseNumber,
            doctor.ConsultationRoom);
    }

    public async Task<DoctorListResponse> GetAll()
    {
        var doctors = await _doctorRepo.GetAll();
        var doctorResponses = doctors.Select(d => 
            new DoctorDetailResponse(
                d.Id, 
                d.Name, 
                d.Email, 
                d.PhoneNumber, 
                d.Address,
                d.Specialization,
                d.LicenseNumber,
                d.ConsultationRoom)).ToList();
        return new DoctorListResponse(doctorResponses);
    }

    public async Task<CreateStaffResponse> RegisterDoctor(CreateDoctorRequest req)
    {
        var doctor = new Doctor
        {
            Type = StaffType.Doctor,
            Name = req.Name,
            Email = req.Email,
            PhoneNumber = req.PhoneNumber,
            Address = req.Address,
            Specialization = req.Specialization,
            LicenseNumber = req.LicenseNumber,
            ConsultationRoom = req.ConsultationRoom
        };

        _doctorRepo.Add(doctor);
        await _doctorRepo.SaveChangesAsync();

        return new CreateStaffResponse(doctor.Id);
    }

    public async Task UpdateDoctor(UpdateDoctorRequest req)
    {
        var doctor = await _doctorRepo.GetById(req.Id);
        if (doctor is null)
        {
            throw new NotFoundException("Doctor", req.Id.ToString());
        }

        doctor.Update(req.Name, req.Email, req.PhoneNumber, req.Address);
        doctor.Specialization = req.Specialization;
        doctor.LicenseNumber = req.LicenseNumber;
        doctor.ConsultationRoom = req.ConsultationRoom;

        await _doctorRepo.SaveChangesAsync();
    }

    public async Task DeleteDoctor(Guid id)
    {
        var doctor = await _doctorRepo.GetById(id);
        if (doctor is null)
        {
            throw new NotFoundException("Doctor", id.ToString());
        }

        _doctorRepo.Delete(doctor);
        await _doctorRepo.SaveChangesAsync();
    }
}
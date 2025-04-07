using Appointments.Api.Application.Interfaces;
using Appointments.Api.Domain.Entities.Appointments;
using Appointments.Api.Domain.Enums;

namespace Appointments.Api.Application;

public class AppointmentService(IAppointmentRepo appointmentRepo, ISlotRepo slotRepo) : IAppointmentService
{
    public async Task<List<AppointmentDetailResponse>> GetAll(Guid? doctorId, Guid? patientId, DateTime? date)
    {
        var appointments = await appointmentRepo.GetAll();
        var filteredAppointments = appointments.Where(a =>
            (!doctorId.HasValue || a.Slot.DoctorId == doctorId) &&
            (!patientId.HasValue || a.PatientId == patientId) &&
            (!date.HasValue || a.Slot.StartTime.Date == date.Value.Date)).ToList();
        
        var appointmentDetails = filteredAppointments.Select(a =>
        {
            var patient = fakePatients.FirstOrDefault(p => p.Id == a.PatientId)!;
            return new AppointmentDetailResponse(a.Id,
                                                 a.SlotId,
                                                 a.Slot.StartTime,
                                                 a.Slot.EndTime,
                                                 a.Status.ToString(),
                                                 a.PatientId,
                                                 $"{patient.FirstName} {patient.LastName}",
                                                 patient.PhoneNumber,
                                                 patient.Email);
        });

        return appointmentDetails.ToList();
    }
    public async Task<CreateAppointmentResponse> CreateAppointment(CreateAppointmentRequest res)
    {
        var slot = await slotRepo.GetById(res.SlotId);
        if (slot is null)
        {
            throw new Exception("Slot not found");
        }

        if (slot.Status != SlotStatus.AVAILABLE)
        {
            throw new Exception("Slot is not available");
        }

        Appointment appointment = new()
        {
            Id = Guid.NewGuid(),
            PatientId = res.PatientId,
            SlotId = res.SlotId,
            Status = AppointmentStatus.PENDING
        };

        appointmentRepo.Add(appointment);

        appointment.Slot.Status = SlotStatus.BOOKED;

        await appointmentRepo.SaveChangesAsync();

        return new CreateAppointmentResponse(appointment.Id);
    }

    public async Task<AppointmentDetailResponse> GetAppointmentById(Guid appointmentId)
    {
        var appointment = await appointmentRepo.GetById(appointmentId);

        if (appointment is null)
        {
            throw new Exception("Appointment not found");
        }

        var patient = fakePatients.FirstOrDefault(p => p.Id == appointment.PatientId)!;

        return new AppointmentDetailResponse(appointmentId,
                                             appointment.SlotId,
                                             appointment.Slot.StartTime,
                                             appointment.Slot.EndTime,
                                             appointment.Status.ToString(),
                                             appointment.PatientId,
                                             $"{patient.FirstName} {patient.LastName}",
                                             patient.PhoneNumber,
                                             patient.Email);
    }

    public async Task UpdateAppointment(UpdateAppointmentRequest req)
    {
        var appointment = await appointmentRepo.GetById(req.AppointmentId);

        if (appointment is null)
        {
            throw new Exception("Appointment not found");
        }

        appointment.SlotId = req.SlotId;
        appointment.PatientId = req.PatientId;
        appointment.SlotId = req.SlotId;
        appointment.Status = req.Status;

        await appointmentRepo.SaveChangesAsync();
    }

    public async Task CancelAppointment(Guid appointmentId)
    {
        var appointment = await appointmentRepo.GetById(appointmentId);

        if (appointment is null)
        {
            throw new Exception("Appointment not found");
        }

        appointment.Status = AppointmentStatus.CANCELLED;
        appointment.Slot.Status = SlotStatus.AVAILABLE;

        await appointmentRepo.SaveChangesAsync();
    }
    public async Task RescheduleAppointment(Guid appointmentId, Guid newSlotId)
    {
        var appointment = await appointmentRepo.GetById(appointmentId);
        if (appointment is null)
        {
            throw new Exception("Appointment not found");
        }

        var newSlot = await slotRepo.GetById(newSlotId);
        if (newSlot is null)
        {
            throw new Exception("New slot not found");
        }

        if (newSlot.Status != SlotStatus.AVAILABLE)
        {
            throw new Exception("New slot is not available");
        }

        if (appointment.Status != AppointmentStatus.PENDING)
        {
            throw new Exception("Cannot reschedule a confirmed, completed or cancelled appointment");
        }

        appointment.Slot.Status = SlotStatus.AVAILABLE;
        appointment.SlotId = newSlotId;
        newSlot.Status = SlotStatus.BOOKED;

        await appointmentRepo.SaveChangesAsync();
    }

    public async Task ConfirmAppointment(Guid appointmentId)
    {
        var appointment = await appointmentRepo.GetById(appointmentId);
        if (appointment is null)
        {
            throw new Exception("Appointment not found");
        }

        if (appointment.Status != AppointmentStatus.PENDING)
        {
            throw new Exception("Cannot confirm a completed or cancelled appointment");
        }

        appointment.Status = AppointmentStatus.CONFIRMED;

        await appointmentRepo.SaveChangesAsync();
    }

    public async Task CompleteAppointment(Guid appointmentId)
    {
        var appointment = await appointmentRepo.GetById(appointmentId);
        if (appointment is null)
        {
            throw new Exception("Appointment not found");
        }

        if (appointment.Status != AppointmentStatus.CONFIRMED)
        {
            throw new Exception("Cannot complete non-confirmed appointment");
        }

        appointment.Status = AppointmentStatus.COMPLETED;

        await appointmentRepo.SaveChangesAsync();
    }

    private readonly List<Patient> fakePatients =
[
    new Patient
    {
        Id = new Guid("A2559B6B-0CA9-4D88-90B8-9565386339C0"),
        FirstName = "Minh",
        LastName = "Nguyen",
        PhoneNumber = "0912345678",
        Email = "minh.nguyen@gmail.com",
        DateOfBirth = new DateTime(1990, 5, 15)
    },
    new Patient
    {
        Id = new Guid("BA3BD31B-CF68-471D-B336-D4485FFF6BD7"),
        FirstName = "Thi",
        LastName = "Tran",
        PhoneNumber = "0987654321",
        Email = "thi.tran@yahoo.com",
        DateOfBirth = new DateTime(1985, 8, 22)
    },
    new Patient
    {
        Id = new Guid("3E662D8D-5250-441F-B764-D9EFA0351492"),
        FirstName = "Hoang",
        LastName = "Pham",
        PhoneNumber = "0909123456",
        Email = "hoang.pham@outlook.com",
        DateOfBirth = new DateTime(1995, 3, 10)
    },
    new Patient
    {
        Id = new Guid("07F448CA-50B9-406C-B584-B6107822EFBF"),
        FirstName = "Linh",
        LastName = "Le",
        PhoneNumber = "0932145678",
        Email = "linh.le@gmail.com",
        DateOfBirth = new DateTime(1988, 12, 5)
    },
    new Patient
    {
        Id = new Guid("24645F44-8594-41E1-89D1-E22EBFD48522"),
        FirstName = "Duc",
        LastName = "Vo",
        PhoneNumber = "0978123456",
        Email = "duc.vo@hotmail.com",
        DateOfBirth = new DateTime(1992, 7, 18)
    }
];
}


public class Patient
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
}

using Appointments.Api.Domain.Entities.Appointments;

namespace Appointments.Api.Application.Interfaces;

public interface IAppointmentRepo
{
    Task<Appointment?> GetById(Guid id);
    Task<List<Appointment>> GetAll();
    void Add(Appointment staff);
    void Delete(Appointment staff);
    Task SaveChangesAsync();
}

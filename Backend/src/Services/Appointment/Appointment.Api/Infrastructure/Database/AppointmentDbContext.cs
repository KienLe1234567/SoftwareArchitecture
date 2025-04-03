using Appointments.Api.Domain.Entities.Appointments;
using Appointments.Api.Domain.Entities.TimeSlots;
using Microsoft.EntityFrameworkCore;

namespace Appointments.Api.Infrastructure.Database;

public class AppointmentDbContext(DbContextOptions<AppointmentDbContext> options) : DbContext(options)
{
    public DbSet<Appointment> Appointments { get; set; } = default!;
    public DbSet<TimeSlot> Slots { get; set; } = default!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("appointment");
    }
}

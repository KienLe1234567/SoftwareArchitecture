using Microsoft.EntityFrameworkCore;

namespace Staffs.Api.Infrastructure.Database;

public class StaffDbContext(DbContextOptions<StaffDbContext> options) : DbContext(options)
{
    public DbSet<Staff> Staff { get; set; } = default!;
    public DbSet<Doctor> Doctors { get; set; } = default!;
    public DbSet<Nurse> Nurses { get; set; } = default!;
    public DbSet<Shift> Shifts { get; set; } = default!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("staff");

        // Configure TPT inheritance
        modelBuilder.Entity<Staff>()
            .ToTable("Staff");

        modelBuilder.Entity<Doctor>()
            .ToTable("Doctors");

        modelBuilder.Entity<Nurse>()
            .ToTable("Nurses");
    }
}

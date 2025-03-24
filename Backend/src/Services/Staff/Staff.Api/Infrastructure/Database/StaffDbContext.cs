using Microsoft.EntityFrameworkCore;

namespace Staffs.Api.Infrastructure.Database;

public class StaffDbContext(DbContextOptions<StaffDbContext> options) : DbContext(options)
{
    public DbSet<Staff> Staff { get; set; } = default!;
    public DbSet<Shift> Shifts { get; set; } = default!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("staff");
    }
}

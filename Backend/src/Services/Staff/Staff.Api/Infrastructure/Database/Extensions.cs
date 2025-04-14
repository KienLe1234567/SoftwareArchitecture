using Microsoft.EntityFrameworkCore;

namespace Staffs.Api.Infrastructure.Database;

public static class Extensions
{
    public static async Task InitializeDatabaseAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();

        var context = scope.ServiceProvider.GetRequiredService<StaffDbContext>();

        await context.Database.MigrateAsync();
    }

    public static void AddStaffDbContext(this IServiceCollection services, string connectionString)
    {
        services.AddDbContext<StaffDbContext>(options =>
        {
            options.UseSqlServer(connectionString);
        });
    }
}

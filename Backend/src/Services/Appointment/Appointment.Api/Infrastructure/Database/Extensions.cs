using Microsoft.EntityFrameworkCore;

namespace Appointments.Api.Infrastructure.Database;

public static class Extensions
{
    public static async Task InitializeDatabaseAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();

        var context = scope.ServiceProvider.GetRequiredService<AppointmentDbContext>();

        await context.Database.MigrateAsync();
    }

    public static void AddAppointmentDbContext(this IServiceCollection services, string connectionString)
    {
        services.AddDbContext<AppointmentDbContext>(options =>
        {
            options.UseSqlServer(connectionString);
        });
    }
}

using Staffs.Api.Application.Interfaces;
using Staffs.Api.Infrastructure.Repositories;

namespace Staffs.Api.Application;

public static class Extensions
{
    public static void AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IStaffService, StaffService>();
        services.AddScoped<IStaffRepo, StaffRepo>();
    }
}

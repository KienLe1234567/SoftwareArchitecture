using Staffs.Api.Application.Interfaces;
using Staffs.Api.Infrastructure.Repositories;

namespace Staffs.Api.Application;

public static class Extensions
{
    public static void AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IStaffService, StaffService>();
        services.AddScoped<IShiftService, ShiftService>();
        services.AddScoped<IDoctorService, DoctorService>();
        services.AddScoped<INurseService, NurseService>();
        services.AddScoped<IStaffRepo, StaffRepo>();
        services.AddScoped<IDoctorRepo, DoctorRepo>();
        services.AddScoped<INurseRepo, NurseRepo>();
    }
}

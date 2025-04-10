using Appointments.Api.Application.Interfaces;
using Appointments.Api.Infrastructure.ExternalServices;
using Appointments.Api.Infrastructure.Repositories;

namespace Appointments.Api.Application;

public static class Extensions
{
    public static void AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IAppointmentService, AppointmentService>();
        services.AddScoped<IAppointmentRepo, AppointmentRepo>();

        services.AddScoped<ISlotService, SlotService>();
        services.AddScoped<ISlotRepo, SlotRepo>();

        // External service clients
        services.AddHttpClient<IPatientServiceClient, HttpPatientServiceClient>();
        services.AddHttpClient<IStaffServiceClient, HttpStaffServiceClient>();
    }
}

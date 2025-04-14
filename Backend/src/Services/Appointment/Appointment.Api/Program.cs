using Appointments.Api.Application;
using Appointments.Api.Application.Consumers;
using Appointments.Api.Infrastructure.Database;
using MassTransit;
using Microsoft.OpenApi.Models;
using Shared.Extensions;

var builder = WebApplication.CreateBuilder(args);

var MyAllowSpecificOrigins = "AllowAll";

{
    builder.Services.AddCors(options =>
    {
        options.AddPolicy(name: MyAllowSpecificOrigins, policy =>
        {
            policy.AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
        });
    });

    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new OpenApiInfo { Title = "Appointment API", Version = "v1" });
    });

    builder.Services.AddControllers();
    builder.Services.AddApplication();
    builder.Services.AddAppointmentDbContext(builder.Configuration.GetConnectionString("AppointmentConnection")!);

    builder.Services.AddMassTransit(config =>
    {
        config.SetKebabCaseEndpointNameFormatter();

        config.AddConsumer<DoctorShiftCreatedConsumer>();

        config.UsingRabbitMq((ctx, cfg) =>
        {
            cfg.Host(new Uri(builder.Configuration["MessageBroker:Host"]!), h =>
            {
                h.Username(builder.Configuration["MessageBroker:Username"]!);
                h.Password(builder.Configuration["MessageBroker:Password"]!);
            });

            cfg.ConfigureEndpoints(ctx);
        });
    });

    builder.Services.AddGlobalExceptionHandling();
}

var app = builder.Build();

app.MapControllers();
app.UseCors(MyAllowSpecificOrigins);

app.UseGlobalExceptionHandling();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Appointment API V1");
    });
    await app.InitializeDatabaseAsync();
}

app.Run();

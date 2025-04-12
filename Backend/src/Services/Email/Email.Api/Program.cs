using DotNetEnv;
using Email.Api;
using Email.Api.Consumers;
using MassTransit;
using Shared.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.Configure<SMTPCredentials>(
    builder.Configuration.GetSection("SMTPCredentials"));
builder.Services.AddScoped<IEmailService, SMTPEmailService>();

builder.Services.AddMassTransit(config =>
{
    config.SetKebabCaseEndpointNameFormatter();

    // Add consumers
    config.AddConsumer<AppointmentCreatedConsumer>();
    config.AddConsumer<AppointmentCanceledConsumer>();
    config.AddConsumer<AppointmentConfirmedConsumer>();
    config.AddConsumer<AppointmentRescheduleConsumer>();
    config.AddConsumer<AppointmentCompletedConsumer>();

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

var app = builder.Build();
Env.Load();

app.MapGet("/", () => "Hello World!");

app.Run();

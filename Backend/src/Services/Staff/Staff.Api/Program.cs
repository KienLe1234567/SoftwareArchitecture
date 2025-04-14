using MassTransit;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Staffs.Api.Application;
using Staffs.Api.Infrastructure.Database;
using Shared.Extensions;

var builder = WebApplication.CreateBuilder(args);

var MyAllowSpecificOrigins = "AllowAll";

// DI
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

    builder.Services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new OpenApiInfo { Title = "Staff API", Version = "v1" });
    });
    builder.Services.AddControllers();
    builder.Services.AddApplication();
    builder.Services.AddStaffDbContext(builder.Configuration.GetConnectionString("StaffConnection")!);
    builder.Services.AddGlobalExceptionHandling();

    builder.Services.AddMassTransit(config =>
    {
        config.SetKebabCaseEndpointNameFormatter();
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
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Staff API V1");
    });
    await app.InitializeDatabaseAsync();
}

app.Run();

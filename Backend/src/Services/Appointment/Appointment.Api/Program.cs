using Appointments.Api.Application;
using Appointments.Api.Infrastructure.Database;
using Microsoft.OpenApi.Models;

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
}

var app = builder.Build();

app.MapControllers();
app.UseCors(MyAllowSpecificOrigins);

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

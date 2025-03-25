using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Staffs.Api.Application;
using Staffs.Api.Infrastructure.Database;

var builder = WebApplication.CreateBuilder(args);

// DI
{
    builder.Services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new OpenApiInfo { Title = "Staff API", Version = "v1" });
    });
    builder.Services.AddControllers();
    builder.Services.AddApplication();
    builder.Services.AddStaffDbContext(builder.Configuration.GetConnectionString("StaffConnection")!);
}

var app = builder.Build();

app.MapControllers();

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

using Microsoft.EntityFrameworkCore;
using Staffs.Api.Application;
using Staffs.Api.Infrastructure.Database;

var builder = WebApplication.CreateBuilder(args);

// DI
{
    builder.Services.AddControllers();
    builder.Services.AddApplication();
    builder.Services.AddStaffDbContext(builder.Configuration.GetConnectionString("StaffConnection")!);
}

var app = builder.Build();

app.MapControllers();

if (app.Environment.IsDevelopment())
{
    await app.InitializeDatabaseAsync();
}

app.Run();

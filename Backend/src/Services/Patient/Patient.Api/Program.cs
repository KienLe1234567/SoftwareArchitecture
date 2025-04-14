using Microsoft.OpenApi.Models;
using Patients.Api.Domain.Entities.Patients;
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
        c.SwaggerDoc("v1", new OpenApiInfo { Title = "Patient API", Version = "v1" });
    });
    builder.Services.AddGlobalExceptionHandling();
}

List<Patient> fakePatients =
[
    new Patient
    {
        Id = new Guid("A2559B6B-0CA9-4D88-90B8-9565386339C0"),
        FirstName = "Quan",
        LastName = "Truong",
        PhoneNumber = "0912345678",
        Email = "quantruong150803@gmail.com",
        DateOfBirth = new DateTime(1990, 5, 15)
    },
    new Patient
    {
        Id = new Guid("BA3BD31B-CF68-471D-B336-D4485FFF6BD7"),
        FirstName = "Kien",
        LastName = "Le",
        PhoneNumber = "0987654321",
        Email = "kien.le123@hcmut.edu.vn",
        DateOfBirth = new DateTime(1985, 8, 22)
    },
    new Patient
    {
        Id = new Guid("3E662D8D-5250-441F-B764-D9EFA0351492"),
        FirstName = "Hao",
        LastName = "Phan",
        PhoneNumber = "0909123456",
        Email = "hao.phanbinhhao145@hcmut.edu.vn",
        DateOfBirth = new DateTime(1995, 3, 10)
    },
    new Patient
    {
        Id = new Guid("07F448CA-50B9-406C-B584-B6107822EFBF"),
        FirstName = "Huy",
        LastName = "Nguyen",
        PhoneNumber = "0932145678",
        Email = "huy.nguyenvinh@hcmut.edu.vn",
        DateOfBirth = new DateTime(1988, 12, 5)
    },
    new Patient
    {
        Id = new Guid("24645F44-8594-41E1-89D1-E22EBFD48522"),
        FirstName = "Thuan",
        LastName = "Phan",
        PhoneNumber = "0978123456",
        Email = "thuanphan6879tt1404@gmail.com",
        DateOfBirth = new DateTime(1992, 7, 18)
    }
];


var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Patient API V1");
    });
}
app.UseCors(MyAllowSpecificOrigins);
app.UseGlobalExceptionHandling();

app.MapGet("/api/patients", () =>
{
    return Results.Ok(fakePatients);
});

app.MapGet("/api/patients/{patientId:guid}", (Guid patientId) =>
{
    var patient = fakePatients.FirstOrDefault(p => p.Id == patientId);
    if (patient == null)
    {
        return Results.NotFound();
    }
    return Results.Ok(patient);
});

app.Run();

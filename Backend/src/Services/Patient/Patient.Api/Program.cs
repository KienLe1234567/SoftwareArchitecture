using Microsoft.OpenApi.Models;
using Patients.Api.Domain.Entities.Patients;
using Shared.Extensions;

var builder = WebApplication.CreateBuilder(args);

{
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
        FirstName = "Minh",
        LastName = "Nguyen",
        PhoneNumber = "0912345678",
        Email = "minh.nguyen@gmail.com",
        DateOfBirth = new DateTime(1990, 5, 15)
    },
    new Patient
    {
        Id = new Guid("BA3BD31B-CF68-471D-B336-D4485FFF6BD7"),
        FirstName = "Thi",
        LastName = "Tran",
        PhoneNumber = "0987654321",
        Email = "thi.tran@yahoo.com",
        DateOfBirth = new DateTime(1985, 8, 22)
    },
    new Patient
    {
        Id = new Guid("3E662D8D-5250-441F-B764-D9EFA0351492"),
        FirstName = "Hoang",
        LastName = "Pham",
        PhoneNumber = "0909123456",
        Email = "hoang.pham@outlook.com",
        DateOfBirth = new DateTime(1995, 3, 10)
    },
    new Patient
    {
        Id = new Guid("07F448CA-50B9-406C-B584-B6107822EFBF"),
        FirstName = "Linh",
        LastName = "Le",
        PhoneNumber = "0932145678",
        Email = "linh.le@gmail.com",
        DateOfBirth = new DateTime(1988, 12, 5)
    },
    new Patient
    {
        Id = new Guid("24645F44-8594-41E1-89D1-E22EBFD48522"),
        FirstName = "Duc",
        LastName = "Vo",
        PhoneNumber = "0978123456",
        Email = "duc.vo@hotmail.com",
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

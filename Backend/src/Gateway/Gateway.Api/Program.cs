var builder = WebApplication.CreateBuilder(args);

var staffApiUrl = Environment.GetEnvironmentVariable("STAFF_API_URL");
var appointmentApiUrl = Environment.GetEnvironmentVariable("APPOINTMENT_API_URL");
var billingApiUrl = Environment.GetEnvironmentVariable("BILLING_API_URL");
var patientApiUrl = Environment.GetEnvironmentVariable("PATIENT_API_URL");

builder.Configuration["ReverseProxy:Clusters:staffs-cluster:Destinations:destination1:Address"] = staffApiUrl;
builder.Configuration["ReverseProxy:Clusters:appointments-cluster:Destinations:destination1:Address"] = appointmentApiUrl;
builder.Configuration["ReverseProxy:Clusters:billing-cluster:Destinations:destination1:Address"] = billingApiUrl;
builder.Configuration["ReverseProxy:Clusters:patients-cluster:Destinations:destination1:Address"] = patientApiUrl;

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

var app = builder.Build();

// Configure the HTTP request pipeline.
app.MapReverseProxy();

app.Run();

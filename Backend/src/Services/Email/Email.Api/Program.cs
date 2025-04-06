using DotNetEnv;
using Email.Api;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<IEmailService, EmailService>();

var app = builder.Build();
Env.Load();

app.MapGet("/", () => "Hello World!");

app.Run();

using MassTransit;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Staffs.Api.Application;
using Staffs.Api.Infrastructure.Database;

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

    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = builder.Configuration["Jwt:Issuer"];
        options.Audience = builder.Configuration["Jwt:Audience"];
        options.RequireHttpsMetadata = false;

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKeyResolver = (token, securityToken, kid, validationParameters) =>
            {
                // Fetch the public keys dynamically from JWKS endpoint
                var client = new HttpClient();
                var jwks = client.GetFromJsonAsync<JsonWebKeySet>($"{Environment.GetEnvironmentVariable("IDENTITY_API_URL")}/.well-known/jwks.json").Result;
                return jwks!.Keys;
            }
        };
    });
}

var app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.UseCors(MyAllowSpecificOrigins);

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

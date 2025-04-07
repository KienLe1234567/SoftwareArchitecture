using Identity.Api;
using Identity.Api.Dtos;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Security.Cryptography;

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

    var rsa = RSA.Create();
    rsa.ImportFromPem(File.ReadAllText("private-key.pem"));
    builder.Services.AddSingleton(new RsaSecurityKey(rsa));

    builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    }).AddJwtBearer(options =>
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
            IssuerSigningKey = new RsaSecurityKey(rsa),
        };
    });

    builder.Services.AddAuthorization();

    builder.Services.AddScoped<IdentityService>();

    builder.Services.AddDbContext<IdentityDbContext>(options =>
            options.UseSqlServer(builder.Configuration.GetConnectionString("IdentityConnection")));

    builder.Services.AddIdentity<AppUser, IdentityRole<Guid>>(options =>
    {
        options.User.AllowedUserNameCharacters = "";
        options.User.RequireUniqueEmail = true;
    })
        .AddEntityFrameworkStores<IdentityDbContext>()
        .AddDefaultTokenProviders();

    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new OpenApiInfo { Title = "Identity API", Version = "v1" });
    });
}

var app = builder.Build();

app.MapPost("/api/auth/login", async (IdentityService identityService, [FromBody] LoginRequest req) =>
{
    var result = await identityService.LoginAsync(req);
    if (result.Succeeded)
    {
        return Results.Ok(result);
    }

    return Results.BadRequest(result);
});

app.MapPost("/api/auth/register", async (IdentityService identityService, [FromBody] RegisterRequest req) =>
{
    var result = await identityService.RegisterAsync(req);
    if (result.Succeeded)
    {
        return Results.Ok(result);
    }

    return Results.BadRequest(result);
});

app.MapPost("/api/auth/refresh", async (IdentityService identityService, [FromBody] TokenRenewalRequest req) =>
{
    var result = await identityService.RefreshAsync(req);
    if (result.Succeeded)
    {
        return Results.Ok(result);
    }

    return Results.BadRequest(result);
});

app.MapGet("/.well-known/jwks.json", (IdentityService identityService) =>
{
    var rsa = RSA.Create();
    rsa.ImportFromPem(File.ReadAllText("public-key.pem"));
    var parameters = rsa.ExportParameters(false); // false for public key
    var jsonWebKey = new
    {
        kty = "RSA",
        n = Base64UrlEncoder.Encode(parameters.Modulus),
        e = Base64UrlEncoder.Encode(parameters.Exponent)
    };
    return Results.Ok(new { keys = new[] { jsonWebKey } });
});

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Identity API V1");
    });

    using var scope = app.Services.CreateScope();

    var context = scope.ServiceProvider.GetRequiredService<IdentityDbContext>();

    await context.Database.MigrateAsync();
}

app.UseAuthentication();
app.UseCors(MyAllowSpecificOrigins);
app.UseAuthorization();

app.Run();

using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Identity.Api.Dtos;

namespace Identity.Api;

public class IdentityService
{
    private const int AccessTokenExpirationInSeconds = 60 * 60 * 2;
    private const int RefreshTokenExpirationInHours = 24 * 10;
    private readonly UserManager<AppUser> _userManager;
    private readonly IConfiguration _configuration;
    private readonly ILogger<IdentityService> _logger;
    private readonly RsaSecurityKey _rsaKey;

    public IdentityService(UserManager<AppUser> userManager, ILogger<IdentityService> logger, RsaSecurityKey rsaKey, IConfiguration configuration)
    {
        _userManager = userManager;
        _logger = logger;
        _rsaKey = rsaKey;
        _configuration = configuration;
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest req)
    {
        var user = await _userManager.FindByEmailAsync(req.Email);
        if (user == null || !await _userManager.CheckPasswordAsync(user, req.Password))
        {
            return new LoginResponse(false, "", 0, "");
        }

        string accessToken = GenerateJwtToken(req.Email);
        string refreshToken = GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddHours(RefreshTokenExpirationInHours);
        await _userManager.UpdateAsync(user);

        return new LoginResponse(true, accessToken, AccessTokenExpirationInSeconds, refreshToken);
    }

    public async Task<RegisterResponse> RegisterAsync(RegisterRequest req)
    {
        var user = new AppUser
        {
            Id = Guid.NewGuid(),
            Email = req.Email
        };
        user.UserName = user.Email;

        var result = await _userManager.CreateAsync(user, req.Password);

        return new RegisterResponse(
            result.Succeeded,
            result.Errors.Select(e => e.Description)
        );
    }

    public async Task<LoginResponse> RefreshAsync(TokenRenewalRequest req)
    {
        var principal = GetTokenPrincipal(req.AccessToken);
        if (principal?.Identity?.Name is null)
        {
            return new LoginResponse(false, "", 0, "");
        }
        var user = await _userManager.FindByEmailAsync(principal.Identity.Name);
        if (user is null || user.RefreshToken != req.RefreshToken || DateTime.UtcNow > user.RefreshTokenExpiryTime)
        {
            return new LoginResponse(false, "", 0, "");
        }
        string newRefreshToken = GenerateRefreshToken();

        string newJwtToken = GenerateJwtToken(principal.Identity.Name);

        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddHours(RefreshTokenExpirationInHours);
        await _userManager.UpdateAsync(user);

        return new LoginResponse(true, newJwtToken, AccessTokenExpirationInSeconds, newRefreshToken);
    }

    private string GenerateJwtToken(string email)
    {
        var claims = new List<Claim> {
            new Claim(ClaimTypes.Name, email)
        };

        SigningCredentials signingCred = new(_rsaKey, SecurityAlgorithms.RsaSha256);
        SecurityToken securityToken = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddSeconds(AccessTokenExpirationInSeconds),
            issuer: _configuration["Issuer"],
            audience: _configuration["Audience"],
            signingCredentials: signingCred
        );
        string tokenString = new JwtSecurityTokenHandler().WriteToken(securityToken);
        return tokenString;
    }

    private static string GenerateRefreshToken()
    {
        var randomNumber = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }

    public ClaimsPrincipal? GetTokenPrincipal(string token)
    {
        var rsa = RSA.Create();
        rsa.ImportFromPem(File.ReadAllText("public-key.pem")); // Adjust path as needed
        var securityKey = new RsaSecurityKey(rsa);

        var validation = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = false,
            ValidateIssuerSigningKey = true,
            ValidIssuer = _configuration["Issuer"],
            ValidAudience = _configuration["Audience"],
            IssuerSigningKey = securityKey
        };

        try
        {
            return new JwtSecurityTokenHandler().ValidateToken(token, validation, out _);
        } catch (SecurityTokenException)
        {
            return null;
        }
    }
}
using Microsoft.AspNetCore.Identity;

namespace Identity.Api;

public class AppUser : IdentityUser<Guid>
{
    public string RefreshToken { get; set; } = String.Empty;
    public DateTime RefreshTokenExpiryTime { get; set; }
}
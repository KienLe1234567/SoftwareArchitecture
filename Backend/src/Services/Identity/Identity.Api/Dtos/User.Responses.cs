namespace Identity.Api.Dtos;

public record LoginResponse(bool Succeeded, string AccessToken, int ExpiresIn, string RefreshToken);

public record RegisterResponse(bool Succeeded, IEnumerable<string> Errors);
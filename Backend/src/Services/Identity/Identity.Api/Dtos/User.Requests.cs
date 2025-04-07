namespace Identity.Api.Dtos;

public record TokenRenewalRequest(string AccessToken, string RefreshToken);
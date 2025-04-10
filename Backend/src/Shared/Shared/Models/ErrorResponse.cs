namespace Shared.Models;

public class ErrorResponse
{
    public string Code { get; set; }
    public string Message { get; set; }
    public string? TraceId { get; set; }

    public ErrorResponse(string code, string message, string? traceId = null)
    {
        Code = code;
        Message = message;
        TraceId = traceId;
    }
}
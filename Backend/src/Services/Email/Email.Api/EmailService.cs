using MailKit.Net.Smtp;
using MimeKit;

namespace Email.Api;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;
    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task SendEmailAsync(string to, string subject, string htmlContent)
    {
        var creds = SMTPHelper.GetCredentials();

        _logger.LogInformation("Sending email to {to} with subject {subject}", to, subject);

        var email = SMTPHelper.InitHTMLEmail(creds.FromName, creds.FromEmail, to, subject, htmlContent);

        await SMTPHelper.AuthenticateAndSendAsync(creds, email);
    }
}

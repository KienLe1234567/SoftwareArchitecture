using MailKit.Net.Smtp;
using MimeKit;

namespace Email.Api;

public static class SMTPHelper
{
    public static SMTPCredentials GetCredentials()
    {
        return new SMTPCredentials
        {
            FromName = Environment.GetEnvironmentVariable("FromName") ?? throw new Exception("FromName required"),
            FromEmail = Environment.GetEnvironmentVariable("FromEmail") ?? throw new Exception("FromEmail required"),
            Host = Environment.GetEnvironmentVariable("Host") ?? throw new Exception("Host required"),
            Port = Environment.GetEnvironmentVariable("Port") ?? throw new Exception("Port required"),
            Username = Environment.GetEnvironmentVariable("Username") ?? throw new Exception("Username required"),
            Password = Environment.GetEnvironmentVariable("Password") ?? throw new Exception("Password required")
        };
    }

    public static MimeMessage InitHTMLEmail(string fromName, string fromEmail, string to, string subject, string htmlContent)
    {
        var email = new MimeMessage();
        email.From.Add(new MailboxAddress(
            fromName,
            fromEmail
        ));

        email.To.Add(new MailboxAddress("", to));
        email.Subject = subject;
        email.Body = new TextPart("html") { Text = htmlContent };

        return email;
    }

    public static async Task AuthenticateAndSendAsync(SMTPCredentials creds, MimeMessage email)
    {
        using var smtp = new SmtpClient();
        await smtp.ConnectAsync(
            creds.Host,
            int.Parse(creds.Port),
            MailKit.Security.SecureSocketOptions.StartTls
        );
        await smtp.AuthenticateAsync(
            creds.Username,
            creds.Password
        );
        await smtp.SendAsync(email);
        await smtp.DisconnectAsync(true);
    }
}

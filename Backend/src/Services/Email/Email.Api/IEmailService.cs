﻿namespace Email.Api;

public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string htmlContent);
}

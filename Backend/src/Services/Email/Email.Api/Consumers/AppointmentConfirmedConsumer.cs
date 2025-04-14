using MassTransit;
using Shared.Contracts;

namespace Email.Api.Consumers;

public class AppointmentConfirmedConsumer : IConsumer<AppointmentConfirmedEvent>
{
    private readonly IEmailService _emailService;

    public AppointmentConfirmedConsumer(IEmailService emailService)
    {
        _emailService = emailService;
    }

    public async Task Consume(ConsumeContext<AppointmentConfirmedEvent> context)
    {
        var evt = context.Message;
        string subject = "Your Appointment is Confirmed";
        string body = $@"
<!DOCTYPE html>
<html>
<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
    <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
        <h2 style='color: #2c3e50;'>Appointment Confirmation</h2>
        <p>Dear {evt.PatientName},</p>
        <p>Your appointment with {evt.DoctorName} has been confirmed.</p>
        <div style='background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;'>
            <p style='margin: 5px 0;'><strong>Appointment Details:</strong></p>
            <p style='margin: 5px 0;'>Date: {evt.StartTime.ToLongDateString()}</p>
            <p style='margin: 5px 0;'>Time: {evt.StartTime.ToShortTimeString()} - {evt.EndTime.ToShortTimeString()}</p>
            <p style='margin: 5px 0;'>Doctor: {evt.DoctorName}</p>
        </div>
        <p><strong>Important Reminders:</strong></p>
        <ul style='margin: 10px 0; padding-left: 20px;'>
            <li>Please arrive 10 minutes before your appointment time</li>
            <li>Bring any relevant medical records or test results</li>
            <li>If you're unable to make it, please notify us at least 24 hours in advance</li>
        </ul>
        <p style='color: #666;'>We look forward to seeing you!</p>
    </div>
</body>
</html>";

        await _emailService.SendEmailAsync(evt.PatientEmail, subject, body);
    }
}
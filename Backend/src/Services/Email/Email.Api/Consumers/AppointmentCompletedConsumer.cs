using MassTransit;
using Shared.Contracts;

namespace Email.Api.Consumers;

public class AppointmentCompletedConsumer : IConsumer<AppointmentCompletedEvent>
{
    private readonly IEmailService _emailService;

    public AppointmentCompletedConsumer(IEmailService emailService)
    {
        _emailService = emailService;
    }

    public async Task Consume(ConsumeContext<AppointmentCompletedEvent> context)
    {
        var evt = context.Message;
        string subject = "Your Appointment Has Been Completed";
        string body = $@"
<!DOCTYPE html>
<html>
<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
    <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
        <h2 style='color: #2c3e50;'>Appointment Completed</h2>
        <p>Dear {evt.PatientName},</p>
        <p>Your appointment with {evt.DoctorName} has been completed.</p>
        <div style='background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;'>
            <p style='margin: 5px 0;'><strong>Appointment Details:</strong></p>
            <p style='margin: 5px 0;'>Date: {evt.StartTime.ToLongDateString()}</p>
            <p style='margin: 5px 0;'>Time: {evt.StartTime.ToShortTimeString()} - {evt.EndTime.ToShortTimeString()}</p>
            <p style='margin: 5px 0;'>Doctor: {evt.DoctorName}</p>
        </div>
        <p>Thank you for visiting us. If you have any questions about your visit or need to schedule a follow-up appointment, please don't hesitate to contact us.</p>
        <p style='color: #666;'>We hope you had a good experience with us!</p>
    </div>
</body>
</html>";

        await _emailService.SendEmailAsync(evt.PatientEmail, subject, body);
    }
}
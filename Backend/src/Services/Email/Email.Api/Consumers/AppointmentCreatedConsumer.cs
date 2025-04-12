using MassTransit;
using Shared.Contracts;

namespace Email.Api.Consumers;

public class AppointmentCreatedConsumer : IConsumer<AppointmentCreatedEvent>
{
    private readonly IEmailService _emailService;

    public AppointmentCreatedConsumer(IEmailService emailService)
    {
        _emailService = emailService;
    }

    public async Task Consume(ConsumeContext<AppointmentCreatedEvent> context)
    {
        var evt = context.Message;
        string subject = "Your Appointment Has Been Scheduled";
        string body = $@"
<!DOCTYPE html>
<html>
<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
    <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
        <h2 style='color: #2c3e50;'>Appointment Confirmation</h2>
        <p>Dear {evt.PatientName},</p>
        <p>Your appointment has been successfully scheduled with Doctor {evt.DoctorName}.</p>
        <div style='background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;'>
            <p style='margin: 5px 0;'><strong>Appointment Details:</strong></p>
            <p style='margin: 5px 0;'>Date: {evt.StartTime.ToLongDateString()}</p>
            <p style='margin: 5px 0;'>Time: {evt.StartTime.ToShortTimeString()} - {evt.EndTime.ToShortTimeString()}</p>
            <p style='margin: 5px 0;'>Doctor: {evt.DoctorName}</p>
        </div>
        <p>Please arrive 10 minutes before your scheduled appointment time.</p>
        <p style='color: #666;'>If you need to reschedule or cancel your appointment, please contact us as soon as possible.</p>
    </div>
</body>
</html>";

        await _emailService.SendEmailAsync(evt.PatientEmail, subject, body);
    }
}
using MassTransit;
using Shared.Contracts;

namespace Email.Api.Consumers;

public class AppointmentRescheduleConsumer : IConsumer<AppointmentRescheduleEvent>
{
    private readonly IEmailService _emailService;

    public AppointmentRescheduleConsumer(IEmailService emailService)
    {
        _emailService = emailService;
    }

    public async Task Consume(ConsumeContext<AppointmentRescheduleEvent> context)
    {
        var evt = context.Message;
        string subject = "Your Appointment Has Been Rescheduled";
        string body = $@"
<!DOCTYPE html>
<html>
<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
    <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
        <h2 style='color: #2c3e50;'>Appointment Rescheduling Notice</h2>
        <p>Dear {evt.PatientName},</p>
        <p>Your appointment with {evt.DoctorName} has been rescheduled.</p>
        <div style='background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;'>
            <p style='margin: 5px 0;'><strong>New Appointment Details:</strong></p>
            <p style='margin: 5px 0;'>Date: {evt.NewStartTime.ToLongDateString()}</p>
            <p style='margin: 5px 0;'>Time: {evt.NewStartTime.ToShortTimeString()} - {evt.NewEndTime.ToShortTimeString()}</p>
            <p style='margin: 5px 0;'>Doctor: {evt.DoctorName}</p>
        </div>
        <p>Please arrive 10 minutes before your scheduled appointment time.</p>
        <p style='color: #666;'>If this new time doesn't work for you, please contact us as soon as possible to arrange a different time.</p>
    </div>
</body>
</html>";

        await _emailService.SendEmailAsync(evt.PatientEmail, subject, body);
    }
}
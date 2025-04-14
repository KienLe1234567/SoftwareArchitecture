using MassTransit;
using Shared.Contracts;

namespace Email.Api.Consumers;

public class AppointmentCanceledConsumer : IConsumer<AppointmentCanceledEvent>
{
    private readonly IEmailService _emailService;

    public AppointmentCanceledConsumer(IEmailService emailService)
    {
        _emailService = emailService;
    }

    public async Task Consume(ConsumeContext<AppointmentCanceledEvent> context)
    {
        var evt = context.Message;
        string subject = "Your Appointment Has Been Canceled";
        string body = $@"
<!DOCTYPE html>
<html>
<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
    <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
        <h2 style='color: #2c3e50;'>Appointment Cancellation Notice</h2>
        <p>Dear {evt.PatientName},</p>
        <p>Your appointment with {evt.DoctorName} has been canceled.</p>
        <div style='background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;'>
            <p style='margin: 5px 0;'><strong>Canceled Appointment Details:</strong></p>
            <p style='margin: 5px 0;'>Date: {evt.StartTime.ToLongDateString()}</p>
            <p style='margin: 5px 0;'>Time: {evt.StartTime.ToShortTimeString()} - {evt.EndTime.ToShortTimeString()}</p>
            <p style='margin: 5px 0;'>Doctor: {evt.DoctorName}</p>
            {(!string.IsNullOrEmpty(evt.CancellationReason) ? $"<p style='margin: 5px 0;'>Reason: {evt.CancellationReason}</p>" : "")}
        </div>
        <p>To schedule a new appointment, please visit our booking system or contact our office.</p>
        <p style='color: #666;'>We apologize for any inconvenience this may have caused.</p>
    </div>
</body>
</html>";

        await _emailService.SendEmailAsync(evt.PatientEmail, subject, body);
    }
}
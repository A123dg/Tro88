using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Options;
using Tro88.Application.Common.Interfaces;

namespace Tro88.Infrastructure.Services.Email;

public class EmailSettings
{
    public string SmtpHost { get; set; } = string.Empty;
    public int SmtpPort { get; set; } = 587;
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FromEmail { get; set; } = string.Empty;
    public string FromName { get; set; } = "Tro88";
}

public class EmailService : IEmailService
{
    private readonly EmailSettings _settings;
    private readonly ILogger<EmailService> _logger;

    public EmailService(
        IOptions<EmailSettings> settings,
        ILogger<EmailService> logger)
    {
        _settings = settings.Value;
        _logger = logger;
    }

    public Task SendInvoiceAsync(
        string toEmail,
        string toName,
        string invoiceCode,
        decimal totalAmount,
        DateTime dueDate,
        byte[]? pdfAttachment = null,
        CancellationToken ct = default)
        => SendAsync(
            toEmail,
            $"Invoice {invoiceCode}",
            $"Hello {toName}, invoice {invoiceCode} total {totalAmount:N0} VND due {dueDate:dd/MM/yyyy}.",
            pdfAttachment,
            ct);

    public Task SendInvoiceReminderAsync(
        string toEmail,
        string toName,
        string invoiceCode,
        decimal totalAmount,
        DateTime dueDate,
        CancellationToken ct = default)
        => SendAsync(
            toEmail,
            $"Reminder: {invoiceCode}",
            $"Hello {toName}, invoice {invoiceCode} ({totalAmount:N0} VND) is due on {dueDate:dd/MM/yyyy}.",
            null,
            ct);

    public Task SendContractExpiryNoticeAsync(
        string toEmail,
        string toName,
        string contractCode,
        DateTime endDate,
        int daysLeft,
        CancellationToken ct = default)
        => SendAsync(
            toEmail,
            $"Contract {contractCode} expiring",
            $"Hello {toName}, contract {contractCode} ends {endDate:dd/MM/yyyy} ({daysLeft} days left).",
            null,
            ct);

    public Task SendWelcomeAsync(
        string toEmail,
        string toName,
        CancellationToken ct = default)
        => SendAsync(
            toEmail,
            "Welcome to Tro88",
            $"Hello {toName}, welcome to Tro88!",
            null,
            ct);

    private async Task SendAsync(
        string toEmail,
        string subject,
        string body,
        byte[]? attachment,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(_settings.SmtpHost) ||
            string.IsNullOrWhiteSpace(_settings.FromEmail))
        {
            _logger.LogInformation(
                "Email skipped (not configured): {Subject} -> {To}",
                subject, toEmail);
            return;
        }

        using var client = new SmtpClient(_settings.SmtpHost, _settings.SmtpPort)
        {
            EnableSsl = true,
            Credentials = new NetworkCredential(
                _settings.Username, _settings.Password)
        };

        using var message = new MailMessage
        {
            From = new MailAddress(_settings.FromEmail, _settings.FromName),
            Subject = subject,
            Body = body,
            IsBodyHtml = false
        };
        message.To.Add(toEmail);

        if (attachment is not null)
        {
            message.Attachments.Add(new Attachment(
                new MemoryStream(attachment), "invoice.pdf"));
        }

        await client.SendMailAsync(message, ct);
        _logger.LogInformation("Email sent to {To}: {Subject}", toEmail, subject);
    }
}

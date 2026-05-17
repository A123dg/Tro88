namespace Tro88.Application.Common.Interfaces;

public interface IEmailService
{
    Task SendInvoiceAsync(
        string toEmail,
        string toName,
        string invoiceCode,
        decimal totalAmount,
        DateTime dueDate,
        byte[]? pdfAttachment = null,
        CancellationToken ct = default);

    Task SendInvoiceReminderAsync(
        string toEmail,
        string toName,
        string invoiceCode,
        decimal totalAmount,
        DateTime dueDate,
        CancellationToken ct = default);

    Task SendContractExpiryNoticeAsync(
        string toEmail,
        string toName,
        string contractCode,
        DateTime endDate,
        int daysLeft,
        CancellationToken ct = default);

    Task SendWelcomeAsync(
        string toEmail,
        string toName,
        CancellationToken ct = default);
}

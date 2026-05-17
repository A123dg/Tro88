using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Tro88.Application.Common.Interfaces;
using Tro88.Domain.Enums;

namespace Tro88.Infrastructure.BackgroundServices;

public class InvoiceReminderService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<InvoiceReminderService> _logger;
    private readonly TimeSpan _period = TimeSpan.FromHours(24);

    public InvoiceReminderService(
        IServiceScopeFactory scopeFactory,
        ILogger<InvoiceReminderService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(_period);
        while (!stoppingToken.IsCancellationRequested &&
               await timer.WaitForNextTickAsync(stoppingToken))
        {
            try
            {
                await ProcessAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "InvoiceReminderService error");
            }
        }
    }

    private async Task ProcessAsync(CancellationToken ct)
    {
        await using var scope = _scopeFactory.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
        var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();
        var notificationService = scope.ServiceProvider
            .GetRequiredService<INotificationService>();

        var today = DateTime.UtcNow.Date;
        var dueSoon = await db.Invoices
            .Where(i => i.Status == InvoiceStatus.Unpaid
                && i.DueDate.Date <= today.AddDays(3)
                && i.DueDate.Date >= today)
            .Include(i => i.Contract)
                .ThenInclude(c => c.Tenant)
            .ToListAsync(ct);

        foreach (var invoice in dueSoon)
        {
            var tenant = invoice.Contract.Tenant;
            await emailService.SendInvoiceReminderAsync(
                tenant.Email,
                tenant.FullName,
                invoice.InvoiceCode,
                invoice.TotalAmount,
                invoice.DueDate,
                ct);

            await notificationService.SendAsync(
                tenant.Id,
                "INVOICE_DUE_SOON",
                $"Invoice {invoice.InvoiceCode} due {invoice.DueDate:dd/MM/yyyy}",
                "invoice",
                invoice.Id,
                ct);
        }

        _logger.LogInformation(
            "Sent reminders for {Count} invoices", dueSoon.Count);
    }
}

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Tro88.Application.Common.Interfaces;
using Tro88.Domain.Enums;

namespace Tro88.Infrastructure.BackgroundServices;

public class OverdueInvoiceService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<OverdueInvoiceService> _logger;
    private readonly TimeSpan _period = TimeSpan.FromHours(6);

    public OverdueInvoiceService(
        IServiceScopeFactory scopeFactory,
        ILogger<OverdueInvoiceService> logger)
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
                _logger.LogError(ex, "OverdueInvoiceService error");
            }
        }
    }

    private async Task ProcessAsync(CancellationToken ct)
    {
        await using var scope = _scopeFactory.CreateAsyncScope();
        var db = scope.ServiceProvider
            .GetRequiredService<IApplicationDbContext>();

        var today = DateTime.UtcNow.Date;
        var overdueInvoices = await db.Invoices
            .Where(i =>
                i.Status == InvoiceStatus.Unpaid &&
                i.DueDate.Date < today)
            .ToListAsync(ct);

        foreach (var invoice in overdueInvoices)
        {
            invoice.MarkOverdue();
            _logger.LogInformation(
                "Invoice {Code} marked overdue",
                invoice.InvoiceCode);
        }

        if (overdueInvoices.Count > 0)
            await db.SaveChangesAsync(ct);
    }
}

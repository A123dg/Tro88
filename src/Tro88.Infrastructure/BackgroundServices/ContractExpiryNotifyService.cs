using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Tro88.Application.Common.Interfaces;
using Tro88.Domain.Enums;

namespace Tro88.Infrastructure.BackgroundServices;

public class ContractExpiryNotifyService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<ContractExpiryNotifyService> _logger;
    private readonly TimeSpan _period = TimeSpan.FromHours(24);

    public ContractExpiryNotifyService(
        IServiceScopeFactory scopeFactory,
        ILogger<ContractExpiryNotifyService> logger)
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
                _logger.LogError(ex, "ContractExpiryNotifyService error");
            }
        }
    }

    private async Task ProcessAsync(CancellationToken ct)
    {
        await using var scope = _scopeFactory.CreateAsyncScope();
        var db = scope.ServiceProvider
            .GetRequiredService<IApplicationDbContext>();
        var emailService = scope.ServiceProvider
            .GetRequiredService<IEmailService>();
        var notificationService = scope.ServiceProvider
            .GetRequiredService<INotificationService>();

        var in30Days = DateTime.UtcNow.AddDays(30).Date;
        var expiring = await db.Contracts
            .Include(c => c.Tenant)
            .Where(c =>
                c.Status == ContractStatus.Active &&
                c.EndDate.Date == in30Days &&
                !c.IsDeleted)
            .ToListAsync(ct);

        foreach (var contract in expiring)
        {
            var daysLeft = (contract.EndDate - DateTime.UtcNow).Days;

            await emailService.SendContractExpiryNoticeAsync(
                contract.Tenant.Email,
                contract.Tenant.FullName,
                contract.ContractCode,
                contract.EndDate,
                daysLeft,
                ct);

            await notificationService.SendAsync(
                contract.TenantId,
                "CONTRACT_EXPIRING",
                $"Contract {contract.ContractCode} expires in {daysLeft} days",
                "contract",
                contract.Id,
                ct);
        }
    }
}

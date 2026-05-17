using Microsoft.Extensions.Logging;
using Tro88.Application.Common.Interfaces;
using Tro88.Domain.Enums;

namespace Tro88.Infrastructure.BackgroundServices;

public class ContractExpiryService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<ContractExpiryService> _logger;
    private readonly TimeSpan _period = TimeSpan.FromHours(24);

    public ContractExpiryService(
        IServiceScopeFactory scopeFactory,
        ILogger<ContractExpiryService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(
        CancellationToken stoppingToken)
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
                _logger.LogError(ex, "ContractExpiryService error");
            }
        }
    }

    private async Task ProcessAsync(CancellationToken ct)
    {
        await using var scope = _scopeFactory.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

        var today = DateTime.UtcNow.Date;
        var expired = await db.Contracts
            .Where(c => c.Status == ContractStatus.Active
                && c.EndDate.Date <= today)
            .ToListAsync(ct);

        foreach (var c in expired)
        {
            c.MarkExpired();
            _logger.LogInformation(
                "Contract {Code} expired", c.ContractCode);
        }

        if (expired.Count > 0)
            await db.SaveChangesAsync(ct);
    }
}
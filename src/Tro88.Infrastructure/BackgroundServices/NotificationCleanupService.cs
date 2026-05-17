using Microsoft.Extensions.Logging;
using Tro88.Application.Common.Interfaces;
using Tro88.Domain.Enums;

namespace Tro88.Infrastructure.BackgroundServices;

public class NotificationCleanupService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<NotificationCleanupService> _logger;
    private readonly TimeSpan _period = TimeSpan.FromDays(7);

    public NotificationCleanupService(
        IServiceScopeFactory scopeFactory,
        ILogger<NotificationCleanupService> logger)
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
                _logger.LogError(ex, "NotificationCleanupService error");
            }
        }
    }

    private async Task ProcessAsync(CancellationToken ct)
    {
        await using var scope = _scopeFactory.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

        var cutoffDate = DateTime.UtcNow.AddDays(-30);
        var oldNotifications = await db.Notifications
            .Where(n => n.Status == NotificationStatus.Read
                && n.CreatedAt < cutoffDate)
            .ToListAsync(ct);

        db.Notifications.RemoveRange(oldNotifications);
        await db.SaveChangesAsync(ct);

        _logger.LogInformation(
            "Cleaned up {Count} old notifications", oldNotifications.Count);
    }
}
namespace Tro88.Application.Interfaces.Services;

public interface INotificationService
{
    Task SendAsync(
        Guid userId,
        string title,
        string body,
        string type,
        Guid? referenceId = null,
        CancellationToken ct = default);

    Task SendToMultipleAsync(
        IEnumerable<Guid> userIds,
        string title,
        string body,
        string type,
        Guid? referenceId = null,
        CancellationToken ct = default);
}


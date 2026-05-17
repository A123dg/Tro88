using Tro88.Domain.Entities.Common;

namespace Tro88.Domain.Entities;

public class AiConversation : AuditableEntity
{
    public Guid UserId { get; private set; }
    public string Title { get; private set; } = default!;
    public bool IsActive { get; private set; } = true;

    public User User { get; private set; } = default!;
    public ICollection<AiMessage> Messages { get; private set; }
        = new List<AiMessage>();
    public ICollection<AiAgentTask> Tasks { get; private set; }
        = new List<AiAgentTask>();

    private AiConversation() { }

    public static AiConversation Create(Guid userId, string title)
        => new()
        {
            UserId = userId,
            Title = string.IsNullOrWhiteSpace(title)
                ? "New conversation" : title
        };

    public void UpdateTitle(string title) => Title = title;
    public void Close() => IsActive = false;
}

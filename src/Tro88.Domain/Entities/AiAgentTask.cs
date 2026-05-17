using Tro88.Domain.Entities.Common;
using Tro88.Domain.Enums;

namespace Tro88.Domain.Entities;

public class AiAgentTask : AuditableEntity
{
    public Guid ConversationId { get; private set; }
    public Guid UserId { get; private set; }
    public string TaskType { get; private set; } = default!;
    public string Input { get; private set; } = default!;
    public string? Output { get; private set; }
    public AiTaskStatus Status { get; private set; }
    public string? ErrorMessage { get; private set; }
    public DateTime? CompletedAt { get; private set; }

    public AiConversation Conversation { get; private set; } = default!;

    private AiAgentTask() { }

    public static AiAgentTask Create(
        Guid conversationId, Guid userId,
        string taskType, string input)
        => new()
        {
            ConversationId = conversationId,
            UserId = userId,
            TaskType = taskType,
            Input = input,
            Status = AiTaskStatus.Pending
        };

    public void Start() => Status = AiTaskStatus.Running;

    public void Complete(string output)
    {
        Status = AiTaskStatus.Completed;
        Output = output;
        CompletedAt = DateTime.UtcNow;
    }

    public void Fail(string error)
    {
        Status = AiTaskStatus.Failed;
        ErrorMessage = error;
        CompletedAt = DateTime.UtcNow;
    }
}

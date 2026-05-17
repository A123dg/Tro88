using Tro88.Domain.Entities.Common;

namespace Tro88.Domain.Entities;

public class AiMessage : BaseEntity
{
    public Guid ConversationId { get; private set; }
    public string Role { get; private set; } = default!;
    public string Content { get; private set; } = default!;
    public int? InputTokens { get; private set; }
    public int? OutputTokens { get; private set; }
    public DateTime CreatedAt { get; private set; }

    public AiConversation Conversation { get; private set; } = default!;

    private AiMessage() { }

    public static AiMessage Create(
        Guid conversationId, string role,
        string content,
        int? inputTokens = null,
        int? outputTokens = null)
        => new()
        {
            ConversationId = conversationId,
            Role = role,
            Content = content,
            InputTokens = inputTokens,
            OutputTokens = outputTokens,
            CreatedAt = DateTime.UtcNow
        };
}

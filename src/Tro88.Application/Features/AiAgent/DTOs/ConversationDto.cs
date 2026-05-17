using Tro88.Domain.Entities;

namespace Tro88.Application.Features.AiAgent.DTOs;

public sealed record ConversationDto(
    Guid Id,
    string Title,
    bool IsActive,
    int MessageCount,
    DateTime CreatedAt,
    List<AiMessageDto>? Messages = null)
{
    public static ConversationDto FromEntity(
        AiConversation c,
        bool includeMessages = false)
        => new(c.Id, c.Title, c.IsActive,
               c.Messages.Count, c.CreatedAt,
               includeMessages
                   ? c.Messages
                       .OrderBy(m => m.CreatedAt)
                       .Select(AiMessageDto.FromEntity)
                       .ToList()
                   : null);
}

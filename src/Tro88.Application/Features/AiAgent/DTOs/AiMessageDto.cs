using Tro88.Domain.Entities;

namespace Tro88.Application.Features.AiAgent.DTOs;

public sealed record AiMessageDto(
    Guid Id,
    string Role,
    string Content,
    int? InputTokens,
    int? OutputTokens,
    DateTime CreatedAt)
{
    public static AiMessageDto FromEntity(AiMessage m)
        => new(m.Id, m.Role, m.Content,
               m.InputTokens, m.OutputTokens,
               m.CreatedAt);
}

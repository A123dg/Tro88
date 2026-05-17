using Tro88.Domain.Entities;

namespace Tro88.Application.Features.AiAgent.DTOs;

public sealed record AgentTaskDto(
    Guid Id,
    string TaskType,
    string Input,
    string? Output,
    string Status,
    string? ErrorMessage,
    DateTime? CompletedAt,
    DateTime CreatedAt)
{
    public static AgentTaskDto FromEntity(AiAgentTask t)
        => new(t.Id, t.TaskType, t.Input, t.Output,
               t.Status.ToString(), t.ErrorMessage,
               t.CompletedAt, t.CreatedAt);
}

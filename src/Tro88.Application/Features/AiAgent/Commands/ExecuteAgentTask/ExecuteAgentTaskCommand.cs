using MediatR;
using Tro88.Application.Features.AiAgent.DTOs;

namespace Tro88.Application.Features.AiAgent.Commands.ExecuteAgentTask;

public record ExecuteAgentTaskCommand(
    Guid ConversationId,
    string TaskType,
    string Input) : IRequest<AgentTaskDto>;

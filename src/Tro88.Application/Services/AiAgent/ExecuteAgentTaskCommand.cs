using MediatR;
using Tro88.Application.Services.AiAgent.DTOs;

namespace Tro88.Application.Services.AiAgent.Commands.ExecuteAgentTask;

public record ExecuteAgentTaskCommand(
    Guid ConversationId,
    string TaskType,
    string Input) : IRequest<AgentTaskDto>;


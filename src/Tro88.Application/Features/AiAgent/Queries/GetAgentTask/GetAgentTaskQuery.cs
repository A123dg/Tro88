using MediatR;
using Tro88.Application.Features.AiAgent.DTOs;

namespace Tro88.Application.Features.AiAgent.Queries.GetAgentTask;

public record GetAgentTaskQuery(Guid Id) : IRequest<AgentTaskDto>;

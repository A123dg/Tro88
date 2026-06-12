using MediatR;
using Tro88.Application.Services.AiAgent.DTOs;

namespace Tro88.Application.Services.AiAgent.Queries.GetAgentTask;

public record GetAgentTaskQuery(Guid Id) : IRequest<AgentTaskDto>;


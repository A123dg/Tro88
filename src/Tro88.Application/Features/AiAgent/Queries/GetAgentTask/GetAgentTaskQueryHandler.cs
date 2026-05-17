using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common.Constants;
using Tro88.Application.Common.Interfaces;
using Tro88.Application.Features.AiAgent.DTOs;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Features.AiAgent.Queries.GetAgentTask;

public sealed class GetAgentTaskQueryHandler
    : IRequestHandler<GetAgentTaskQuery, AgentTaskDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetAgentTaskQueryHandler(
        IApplicationDbContext db,
        ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<AgentTaskDto> Handle(
        GetAgentTaskQuery request,
        CancellationToken ct)
    {
        var task = await _db.AiAgentTasks
            .AsNoTracking()
            .FirstOrDefaultAsync(t =>
                t.Id == request.Id &&
                t.UserId == _currentUser.UserId, ct)
            ?? throw new NotFoundException(ErrorMessages.AI_TASK_NOT_FOUND);

        return AgentTaskDto.FromEntity(task);
    }
}

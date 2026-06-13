using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Constants;
using Tro88.Application.Interfaces.Services;
using Tro88.Application.Services.AiAgent.DTOs;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Services.AiAgent.Queries.GetAgentTask;

public record GetAgentTaskQuery(Guid Id) : IRequest<AgentTaskDto>
{
    public sealed class Handler : IRequestHandler<GetAgentTaskQuery, AgentTaskDto>
    {
        private readonly IAppDbContext _db;
        private readonly ICurrentUserService _currentUser;

        public Handler(IAppDbContext db, ICurrentUserService currentUser)
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
}

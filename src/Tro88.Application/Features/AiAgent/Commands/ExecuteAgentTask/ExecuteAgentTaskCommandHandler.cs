using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common.Constants;
using Tro88.Application.Common.Interfaces;
using Tro88.Application.Features.AiAgent.DTOs;
using Tro88.Domain.Entities;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Features.AiAgent.Commands.ExecuteAgentTask;

public sealed class ExecuteAgentTaskCommandHandler
    : IRequestHandler<ExecuteAgentTaskCommand, AgentTaskDto>
{
    private readonly IApplicationDbContext _db;
    private readonly IAiService _ai;
    private readonly ICurrentUserService _currentUser;

    public ExecuteAgentTaskCommandHandler(
        IApplicationDbContext db,
        IAiService ai,
        ICurrentUserService currentUser)
    {
        _db = db;
        _ai = ai;
        _currentUser = currentUser;
    }

    public async Task<AgentTaskDto> Handle(
        ExecuteAgentTaskCommand request,
        CancellationToken ct)
    {
        var conversation = await _db.AiConversations
            .FirstOrDefaultAsync(c =>
                c.Id == request.ConversationId &&
                c.UserId == _currentUser.UserId, ct)
            ?? throw new NotFoundException(
                ErrorMessages.AI_CONVERSATION_NOT_FOUND);

        var task = AiAgentTask.Create(
            conversation.Id,
            _currentUser.UserId,
            request.TaskType,
            request.Input);

        task.Start();
        _db.AiAgentTasks.Add(task);
        await _db.SaveChangesAsync(ct);

        var result = await _ai.RunAgentTaskAsync(
            request.TaskType,
            request.Input,
            _currentUser.UserId,
            ct);

        if (result.Success)
            task.Complete(result.Output);
        else
            task.Fail(result.ErrorMessage ?? ErrorMessages.AI_SERVICE_ERROR);

        await _db.SaveChangesAsync(ct);
        return AgentTaskDto.FromEntity(task);
    }
}

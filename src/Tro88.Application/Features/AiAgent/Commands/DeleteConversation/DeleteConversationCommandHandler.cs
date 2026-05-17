using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common.Constants;
using Tro88.Application.Common.Interfaces;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Features.AiAgent.Commands.DeleteConversation;

public sealed class DeleteConversationCommandHandler
    : IRequestHandler<DeleteConversationCommand>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public DeleteConversationCommandHandler(
        IApplicationDbContext db,
        ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task Handle(
        DeleteConversationCommand request,
        CancellationToken ct)
    {
        var conversation = await _db.AiConversations
            .FirstOrDefaultAsync(c =>
                c.Id == request.Id &&
                c.UserId == _currentUser.UserId, ct)
            ?? throw new NotFoundException(
                ErrorMessages.AI_CONVERSATION_NOT_FOUND);

        conversation.Close();
        await _db.SaveChangesAsync(ct);
    }
}

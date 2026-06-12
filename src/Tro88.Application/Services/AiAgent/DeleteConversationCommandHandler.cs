using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Constants;
using Tro88.Application.Interfaces.Services;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Services.AiAgent.Commands.DeleteConversation;

public sealed class DeleteConversationCommandHandler
    : IRequestHandler<DeleteConversationCommand>
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public DeleteConversationCommandHandler(
        IAppDbContext db,
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

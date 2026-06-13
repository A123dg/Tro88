using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Constants;
using Tro88.Application.Interfaces.Services;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Services.AiAgent.Commands.DeleteConversation;

public record DeleteConversationCommand(Guid Id) : IRequest
{
    public sealed class Handler : IRequestHandler<DeleteConversationCommand>
    {
        private readonly IAppDbContext _db;
        private readonly ICurrentUserService _currentUser;

        public Handler(IAppDbContext db, ICurrentUserService currentUser)
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
}

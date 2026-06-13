using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Constants;
using Tro88.Application.Interfaces.Services;
using Tro88.Application.Services.AiAgent.DTOs;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Services.AiAgent.Queries.GetConversationById;

public record GetConversationByIdQuery(Guid Id) : IRequest<ConversationDto>
{
    public sealed class Handler : IRequestHandler<GetConversationByIdQuery, ConversationDto>
    {
        private readonly IAppDbContext _db;
        private readonly ICurrentUserService _currentUser;

        public Handler(IAppDbContext db, ICurrentUserService currentUser)
        {
            _db = db;
            _currentUser = currentUser;
        }

        public async Task<ConversationDto> Handle(
            GetConversationByIdQuery request,
            CancellationToken ct)
        {
            var conversation = await _db.AiConversations
                .AsNoTracking()
                .Include(c => c.Messages)
                .FirstOrDefaultAsync(c =>
                    c.Id == request.Id &&
                    c.UserId == _currentUser.UserId, ct)
                ?? throw new NotFoundException(
                    ErrorMessages.AI_CONVERSATION_NOT_FOUND);

            return ConversationDto.FromEntity(conversation, includeMessages: true);
        }
    }
}

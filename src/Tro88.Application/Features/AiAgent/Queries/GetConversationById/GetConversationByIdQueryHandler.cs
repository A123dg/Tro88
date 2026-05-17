using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common.Constants;
using Tro88.Application.Common.Interfaces;
using Tro88.Application.Features.AiAgent.DTOs;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Features.AiAgent.Queries.GetConversationById;

public sealed class GetConversationByIdQueryHandler
    : IRequestHandler<GetConversationByIdQuery, ConversationDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetConversationByIdQueryHandler(
        IApplicationDbContext db,
        ICurrentUserService currentUser)
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

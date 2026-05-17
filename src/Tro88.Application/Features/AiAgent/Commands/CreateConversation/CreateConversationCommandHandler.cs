using MediatR;
using Tro88.Application.Common.Interfaces;
using Tro88.Application.Features.AiAgent.DTOs;
using Tro88.Domain.Entities;

namespace Tro88.Application.Features.AiAgent.Commands.CreateConversation;

public sealed class CreateConversationCommandHandler
    : IRequestHandler<CreateConversationCommand, ConversationDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateConversationCommandHandler(
        IApplicationDbContext db,
        ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<ConversationDto> Handle(
        CreateConversationCommand request,
        CancellationToken ct)
    {
        var conversation = AiConversation.Create(
            _currentUser.UserId,
            request.Title ?? "New conversation");

        _db.AiConversations.Add(conversation);
        await _db.SaveChangesAsync(ct);

        return ConversationDto.FromEntity(conversation);
    }
}

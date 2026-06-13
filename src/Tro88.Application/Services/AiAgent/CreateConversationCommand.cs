using MediatR;
using Tro88.Application.Interfaces.Services;
using Tro88.Application.Services.AiAgent.DTOs;
using Tro88.Domain.Entities;

namespace Tro88.Application.Services.AiAgent.Commands.CreateConversation;

public record CreateConversationCommand(string? Title) : IRequest<ConversationDto>
{
    public sealed class Handler : IRequestHandler<CreateConversationCommand, ConversationDto>
    {
        private readonly IAppDbContext _db;
        private readonly ICurrentUserService _currentUser;

        public Handler(IAppDbContext db, ICurrentUserService currentUser)
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
}

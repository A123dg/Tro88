using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common.Constants;
using Tro88.Application.Common.Interfaces;
using Tro88.Application.Features.AiAgent.DTOs;
using Tro88.Domain.Entities;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Features.AiAgent.Commands.SendMessage;

public sealed class SendMessageCommandHandler
    : IRequestHandler<SendMessageCommand, AiMessageDto>
{
    private readonly IApplicationDbContext _db;
    private readonly IAiService _ai;
    private readonly ICurrentUserService _currentUser;

    public SendMessageCommandHandler(
        IApplicationDbContext db,
        IAiService ai,
        ICurrentUserService currentUser)
    {
        _db = db;
        _ai = ai;
        _currentUser = currentUser;
    }

    public async Task<AiMessageDto> Handle(
        SendMessageCommand request,
        CancellationToken ct)
    {
        var conversation = await _db.AiConversations
            .Include(c => c.Messages)
            .FirstOrDefaultAsync(c =>
                c.Id == request.ConversationId &&
                c.UserId == _currentUser.UserId, ct)
            ?? throw new NotFoundException(
                ErrorMessages.AI_CONVERSATION_NOT_FOUND);

        if (!conversation.IsActive)
            throw new BusinessRuleException(ErrorMessages.COMMON_422);

        var userMsg = AiMessage.Create(
            conversation.Id, "user", request.Content);
        _db.AiMessages.Add(userMsg);

        var history = conversation.Messages
            .OrderBy(m => m.CreatedAt)
            .Select(m => new AiChatMessage(m.Role, m.Content))
            .ToList();
        history.Add(new AiChatMessage("user", request.Content));

        var systemPrompt =
            $"You are Tro88 AI assistant. Role: {_currentUser.Role}. " +
            "Reply concisely in Vietnamese.";

        var result = await _ai.ChatAsync(history, systemPrompt, ct);

        var assistantMsg = AiMessage.Create(
            conversation.Id, "assistant",
            result.Content,
            result.InputTokens,
            result.OutputTokens);
        _db.AiMessages.Add(assistantMsg);

        await _db.SaveChangesAsync(ct);
        return AiMessageDto.FromEntity(assistantMsg);
    }
}

using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common.Constants;
using Tro88.Application.Common.Interfaces;
using Tro88.Application.Features.AiAgent.DTOs;
using Tro88.Application.Features.AiAgent;
using Tro88.Domain.Entities;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Features.AiAgent.Commands.SendMessage;

public sealed class SendMessageCommandHandler
    : IRequestHandler<SendMessageCommand, AiMessageDto>
{
    private readonly IApplicationDbContext _db;
    private readonly IAiService _ai;
    private readonly ICurrentUserService _currentUser;
    private readonly ILogger<SendMessageCommandHandler> _logger;

    public SendMessageCommandHandler(
        IApplicationDbContext db,
        IAiService ai,
        ICurrentUserService currentUser,
        ILogger<SendMessageCommandHandler> logger)
    {
        _db = db;
        _ai = ai;
        _currentUser = currentUser;
        _logger = logger;
    }

    public async Task<AiMessageDto> Handle(
        SendMessageCommand request,
        CancellationToken ct)
    {
        var conversation = await _db.AiConversations
            .Include(c => c.Messages)
            .FirstOrDefaultAsync(c =>
                c.Id == request.ConversationId &&
                c.UserId == _currentUser.UserId &&
                c.IsActive, ct)
            ?? throw new NotFoundException(ErrorMessages.AI_CONVERSATION_NOT_FOUND);

        var userMsg = AiMessage.Create(
            conversation.Id, "user", request.Content);
        _db.AiMessages.Add(userMsg);

        var history = conversation.Messages
            .OrderBy(m => m.CreatedAt)
            .TakeLast(20)
            .Select(m => new AiChatMessage(m.Role, m.Content))
            .ToList();
        history.Add(new AiChatMessage("user", request.Content));

        var user = await _db.Users
            .AsNoTracking()
            .FirstAsync(u => u.Id == _currentUser.UserId, ct);

        var systemPrompt = SystemPromptBuilder.Build(
            user.Role.ToString(), user.FullName);

        AiChatResult result;
        try
        {
            result = await _ai.ChatAsync(history, systemPrompt, ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "AI service error for user {UserId}", _currentUser.UserId);
            result = new AiChatResult(
                "Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau.",
                0, 0);
        }

        var assistantMsg = AiMessage.Create(
            conversation.Id, "assistant",
            result.Content,
            result.InputTokens,
            result.OutputTokens);
        _db.AiMessages.Add(assistantMsg);

        if (conversation.Messages.Count == 0)
        {
            var title = request.Content.Length > 50
                ? request.Content[..50] + "..."
                : request.Content;
            conversation.UpdateTitle(title);
        }

        await _db.SaveChangesAsync(ct);

        return AiMessageDto.FromEntity(assistantMsg);
    }
}
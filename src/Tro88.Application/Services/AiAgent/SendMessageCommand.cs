using MediatR;
using Tro88.Application.Services.AiAgent.DTOs;

namespace Tro88.Application.Services.AiAgent.Commands.SendMessage;

public record SendMessageCommand(
    Guid ConversationId,
    string Content) : IRequest<AiMessageDto>;


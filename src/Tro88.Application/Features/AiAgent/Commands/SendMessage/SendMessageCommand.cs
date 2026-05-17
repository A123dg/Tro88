using MediatR;
using Tro88.Application.Features.AiAgent.DTOs;

namespace Tro88.Application.Features.AiAgent.Commands.SendMessage;

public record SendMessageCommand(
    Guid ConversationId,
    string Content) : IRequest<AiMessageDto>;

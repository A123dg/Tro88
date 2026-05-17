using MediatR;
using Tro88.Application.Features.AiAgent.DTOs;

namespace Tro88.Application.Features.AiAgent.Commands.CreateConversation;

public record CreateConversationCommand(string? Title) : IRequest<ConversationDto>;

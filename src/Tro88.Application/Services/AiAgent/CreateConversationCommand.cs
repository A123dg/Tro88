using MediatR;
using Tro88.Application.Services.AiAgent.DTOs;

namespace Tro88.Application.Services.AiAgent.Commands.CreateConversation;

public record CreateConversationCommand(string? Title) : IRequest<ConversationDto>;


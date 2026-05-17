using MediatR;

namespace Tro88.Application.Features.AiAgent.Commands.DeleteConversation;

public record DeleteConversationCommand(Guid Id) : IRequest;

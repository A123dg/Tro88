using MediatR;

namespace Tro88.Application.Services.AiAgent.Commands.DeleteConversation;

public record DeleteConversationCommand(Guid Id) : IRequest;


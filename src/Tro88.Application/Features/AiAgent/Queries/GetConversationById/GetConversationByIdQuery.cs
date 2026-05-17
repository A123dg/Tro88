using MediatR;
using Tro88.Application.Features.AiAgent.DTOs;

namespace Tro88.Application.Features.AiAgent.Queries.GetConversationById;

public record GetConversationByIdQuery(Guid Id) : IRequest<ConversationDto>;

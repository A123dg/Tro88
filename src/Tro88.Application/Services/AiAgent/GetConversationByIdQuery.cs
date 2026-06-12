using MediatR;
using Tro88.Application.Services.AiAgent.DTOs;

namespace Tro88.Application.Services.AiAgent.Queries.GetConversationById;

public record GetConversationByIdQuery(Guid Id) : IRequest<ConversationDto>;


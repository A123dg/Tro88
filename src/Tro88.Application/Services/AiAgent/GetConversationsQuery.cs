using MediatR;
using Tro88.Application.Common;
using Tro88.Application.Services.AiAgent.DTOs;

namespace Tro88.Application.Services.AiAgent.Queries.GetConversations;

public record GetConversationsQuery(
    int Page = 1,
    int PageSize = 20) : IRequest<PagedResult<ConversationDto>>;


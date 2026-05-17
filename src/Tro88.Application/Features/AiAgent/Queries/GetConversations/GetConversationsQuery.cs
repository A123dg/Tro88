using MediatR;
using Tro88.Application.Common.Models;
using Tro88.Application.Features.AiAgent.DTOs;

namespace Tro88.Application.Features.AiAgent.Queries.GetConversations;

public record GetConversationsQuery(
    int Page = 1,
    int PageSize = 20) : IRequest<PagedResult<ConversationDto>>;

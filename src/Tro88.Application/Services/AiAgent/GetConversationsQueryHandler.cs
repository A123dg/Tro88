using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Interfaces.Services;
using Tro88.Application.Common;
using Tro88.Application.Services.AiAgent.DTOs;

namespace Tro88.Application.Services.AiAgent.Queries.GetConversations;

public sealed class GetConversationsQueryHandler
    : IRequestHandler<GetConversationsQuery, PagedResult<ConversationDto>>
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetConversationsQueryHandler(
        IAppDbContext db,
        ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<PagedResult<ConversationDto>> Handle(
        GetConversationsQuery request,
        CancellationToken ct)
    {
        var query = _db.AiConversations
            .AsNoTracking()
            .Include(c => c.Messages)
            .Where(c => c.UserId == _currentUser.UserId);

        var total = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(ct);

        return new PagedResult<ConversationDto>(
            items.Select(c => ConversationDto.FromEntity(c)),
            total,
            request.Page,
            request.PageSize);
    }
}

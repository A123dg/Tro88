using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common.Interfaces;
using Tro88.Application.Common.Models;
using Tro88.Application.Features.Notifications.DTOs;
using Tro88.Domain.Enums;

namespace Tro88.Application.Features.Notifications.Queries.GetNotifications;

public record GetNotificationsQuery(
    int Page = 1,
    int PageSize = 10,
    string? Status = null) : IRequest<PagedResult<NotificationDto>>;

public class GetNotificationsQueryHandler : IRequestHandler<GetNotificationsQuery, PagedResult<NotificationDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetNotificationsQueryHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<PagedResult<NotificationDto>> Handle(GetNotificationsQuery request, CancellationToken ct)
    {
        var query = _db.Notifications
            .Where(n => n.UserId == _currentUser.UserId);

        if (!string.IsNullOrEmpty(request.Status))
            query = query.Where(n => n.Status == Enum.Parse<NotificationStatus>(request.Status));

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(n => n.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(ct);

        return new PagedResult<NotificationDto>(
            items.Select(NotificationDto.FromEntity).ToList(),
            total, request.Page, request.PageSize);
    }
}
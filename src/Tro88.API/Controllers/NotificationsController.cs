using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tro88.Application.Common.Constants;
using Tro88.Application.Common.Models;
using Tro88.Application.Features.Notifications.Commands.MarkNotificationRead;
using Tro88.Application.Features.Notifications.Queries.GetNotifications;

namespace Tro88.API.Controllers;

[Authorize]
public class NotificationsController : BaseApiController
{
    [HttpGet]
    public async Task<IActionResult> GetNotifications([FromQuery] GetNotificationsQuery query)
    {
        var result = await Mediator.Send(query);
        return Ok(ApiResponse<List<NotificationDto>>.Ok(
            result.Items,
            metaData: new MetaData
            {
                Page = query.Page,
                PageSize = query.PageSize,
                Total = result.Total,
                TotalPage = result.TotalPage
            }));
    }

    [HttpPatch("{id}/read")]
    public async Task<IActionResult> MarkNotificationRead(Guid id)
    {
        var result = await Mediator.Send(new MarkNotificationReadCommand(id));
        return Ok(ApiResponse<NotificationDto>.Ok(result, SuccessMessages.MARK_NOTIFICATION_READ_SUCCESS));
    }

    [HttpPatch("read-all")]
    public async Task<IActionResult> MarkAllNotificationsRead()
    {
        await Mediator.Send(new MarkAllNotificationsReadCommand());
        return Ok(ApiResponse<object>.Ok(null));
    }
}
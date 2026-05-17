using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Tro88.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public abstract class BaseApiController : ControllerBase
{
    private IMediator? _mediator;

    protected IMediator Mediator
        => _mediator ??= HttpContext.RequestServices.GetRequiredService<IMediator>();
}

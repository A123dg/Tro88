using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Interfaces.Services;

namespace Tro88.Application.Services;

public record LogoutCommand : IRequest<Unit>
{
public sealed class Handler
    : IRequestHandler<LogoutCommand, Unit>
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public Handler(
        IAppDbContext db,
        ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Unit> Handle(
        LogoutCommand request,
        CancellationToken ct)
    {
        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.Id == _currentUser.UserId, ct);

        if (user != null)
        {
            user.RevokeRefreshToken();
            await _db.SaveChangesAsync(ct);
        }

        return Unit.Value;
    }
}
}



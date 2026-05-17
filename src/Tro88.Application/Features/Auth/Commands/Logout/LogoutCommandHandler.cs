using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common.Interfaces;

namespace Tro88.Application.Features.Auth.Commands.Logout;

public sealed class LogoutCommandHandler
    : IRequestHandler<LogoutCommand, Unit>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public LogoutCommandHandler(
        IApplicationDbContext db,
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
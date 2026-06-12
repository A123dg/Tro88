using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Constants;
using Tro88.Application.Interfaces.Services;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Services;

public record ChangePasswordCommand(
    string CurrentPassword,
    string NewPassword) : IRequest
{
public sealed class Handler
    : IRequestHandler<ChangePasswordCommand>
{
    private readonly IAppDbContext _db;
    private readonly IPasswordHasher _hasher;
    private readonly ICurrentUserService _currentUser;

    public Handler(
        IAppDbContext db,
        IPasswordHasher hasher,
        ICurrentUserService currentUser)
    {
        _db = db;
        _hasher = hasher;
        _currentUser = currentUser;
    }

    public async Task Handle(
        ChangePasswordCommand request,
        CancellationToken ct)
    {
        var user = await _db.Users
            .FirstOrDefaultAsync(u =>
                u.Id == _currentUser.UserId &&
                !u.IsDeleted, ct)
            ?? throw new NotFoundException(ErrorMessages.USER_NOT_FOUND);

        if (!_hasher.Verify(
                request.CurrentPassword, user.PasswordHash))
            throw new BusinessRuleException(
                ErrorMessages.INVALID_CREDENTIALS);

        user.UpdatePasswordHash(_hasher.Hash(request.NewPassword));
        await _db.SaveChangesAsync(ct);
    }
}
}



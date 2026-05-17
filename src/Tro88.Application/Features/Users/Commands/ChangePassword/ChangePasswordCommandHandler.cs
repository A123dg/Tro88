using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common.Constants;
using Tro88.Application.Common.Interfaces;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Features.Users.Commands.ChangePassword;

public sealed class ChangePasswordCommandHandler
    : IRequestHandler<ChangePasswordCommand>
{
    private readonly IApplicationDbContext _db;
    private readonly IPasswordHasher _hasher;
    private readonly ICurrentUserService _currentUser;

    public ChangePasswordCommandHandler(
        IApplicationDbContext db,
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

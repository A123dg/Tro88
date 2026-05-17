using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common.Constants;
using Tro88.Application.Common.Interfaces;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Features.Users.Commands.UploadAvatar;

public sealed class UploadAvatarCommandHandler
    : IRequestHandler<UploadAvatarCommand, string>
{
    private readonly IApplicationDbContext _db;
    private readonly IStorageService _storage;
    private readonly ICurrentUserService _currentUser;

    public UploadAvatarCommandHandler(
        IApplicationDbContext db,
        IStorageService storage,
        ICurrentUserService currentUser)
    {
        _db = db;
        _storage = storage;
        _currentUser = currentUser;
    }

    public async Task<string> Handle(
        UploadAvatarCommand request,
        CancellationToken ct)
    {
        var user = await _db.Users
            .FirstOrDefaultAsync(u =>
                u.Id == _currentUser.UserId &&
                !u.IsDeleted, ct)
            ?? throw new NotFoundException(ErrorMessages.USER_NOT_FOUND);

        var url = await _storage.UploadImageAsync(
            request.ImageStream,
            request.FileName,
            $"tro88/users/{user.Id}",
            ct);

        user.UpdateAvatar(url);
        await _db.SaveChangesAsync(ct);
        return url;
    }
}

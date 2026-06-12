using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Constants;
using Tro88.Application.Interfaces.Services;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Services;

public record UploadAvatarCommand(
    Stream ImageStream,
    string FileName) : IRequest<string>
{
public sealed class Handler
    : IRequestHandler<UploadAvatarCommand, string>
{
    private readonly IAppDbContext _db;
    private readonly IStorageService _storage;
    private readonly ICurrentUserService _currentUser;

    public Handler(
        IAppDbContext db,
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
}



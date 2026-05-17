using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common.Constants;
using Tro88.Application.Common.Interfaces;
using Tro88.Application.Features.Users.DTOs;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Features.Users.Commands.UpdateProfile;

public sealed class UpdateProfileCommandHandler
    : IRequestHandler<UpdateProfileCommand, UserDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public UpdateProfileCommandHandler(
        IApplicationDbContext db,
        ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<UserDto> Handle(
        UpdateProfileCommand request,
        CancellationToken ct)
    {
        var user = await _db.Users
            .FirstOrDefaultAsync(u =>
                u.Id == _currentUser.UserId &&
                !u.IsDeleted, ct)
            ?? throw new NotFoundException(ErrorMessages.USER_NOT_FOUND);

        user.UpdateProfile(
            request.FullName,
            request.PhoneNumber,
            request.NationalId,
            request.DateOfBirth);

        await _db.SaveChangesAsync(ct);
        return UserDto.FromEntity(user);
    }
}

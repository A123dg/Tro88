using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Constants;
using Tro88.Application.DTOs.Responses;
using Tro88.Application.Interfaces.Services;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Services;

public record UpdateProfileCommand(
    string FullName,
    string PhoneNumber,
    string? NationalId,
    DateTime? DateOfBirth) : IRequest<UserDto>
{
public sealed class Handler
    : IRequestHandler<UpdateProfileCommand, UserDto>
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
}



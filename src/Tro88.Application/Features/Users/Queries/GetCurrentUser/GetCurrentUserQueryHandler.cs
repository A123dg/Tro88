using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common.Constants;
using Tro88.Application.Common.Interfaces;
using Tro88.Application.Features.Users.DTOs;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Features.Users.Queries.GetCurrentUser;

public sealed class GetCurrentUserQueryHandler
    : IRequestHandler<GetCurrentUserQuery, UserDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetCurrentUserQueryHandler(
        IApplicationDbContext db,
        ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<UserDto> Handle(
        GetCurrentUserQuery request,
        CancellationToken ct)
    {
        var user = await _db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u =>
                u.Id == _currentUser.UserId &&
                !u.IsDeleted, ct)
            ?? throw new NotFoundException(ErrorMessages.USER_NOT_FOUND);

        return UserDto.FromEntity(user);
    }
}

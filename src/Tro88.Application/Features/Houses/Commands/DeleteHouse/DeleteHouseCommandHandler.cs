using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common.Constants;
using Tro88.Application.Common.Interfaces;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Features.Houses.Commands.DeleteHouse;

public sealed class DeleteHouseCommandHandler
    : IRequestHandler<DeleteHouseCommand, bool>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public DeleteHouseCommandHandler(
        IApplicationDbContext db,
        ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<bool> Handle(
        DeleteHouseCommand request,
        CancellationToken ct)
    {
        var house = await _db.Houses
            .FirstOrDefaultAsync(h => h.Id == request.Id, ct);

        if (house is null)
            throw new NotFoundException(ErrorMessages.HOUSE_NOT_FOUND);

        if (house.OwnerId != _currentUser.UserId &&
            _currentUser.Role != "Admin")
            throw new ForbiddenException(
                ErrorMessages.HOUSE_ACCESS_DENIED);

        house.Delete(_currentUser.UserId);
        await _db.SaveChangesAsync(ct);

        return true;
    }
}
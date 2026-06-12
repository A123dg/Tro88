using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Constants;
using Tro88.Application.DTOs.Responses;
using Tro88.Application.Interfaces.Services;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Services;

public sealed record GetHouseByIdQuery(Guid Id) : IRequest<HouseDto>
{
public sealed class Handler
    : IRequestHandler<GetHouseByIdQuery, HouseDto>
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

    public async Task<HouseDto> Handle(
        GetHouseByIdQuery request,
        CancellationToken ct)
    {
        var house = await _db.Houses
            .Include(h => h.Rooms)
            .FirstOrDefaultAsync(h => h.Id == request.Id, ct);

        if (house is null)
            throw new NotFoundException(ErrorMessages.HOUSE_NOT_FOUND);

        if (house.OwnerId != _currentUser.UserId &&
            _currentUser.Role != "Admin" &&
            _currentUser.Role != "Tenant")
            throw new ForbiddenException(
                ErrorMessages.HOUSE_ACCESS_DENIED);

        return HouseDto.FromEntity(house);
    }
}
}



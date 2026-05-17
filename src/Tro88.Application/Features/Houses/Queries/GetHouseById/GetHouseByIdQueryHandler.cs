using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common.Constants;
using Tro88.Application.Common.Interfaces;
using Tro88.Application.Features.Houses.DTOs;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Features.Houses.Queries.GetHouseById;

public sealed class GetHouseByIdQueryHandler
    : IRequestHandler<GetHouseByIdQuery, HouseDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetHouseByIdQueryHandler(
        IApplicationDbContext db,
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
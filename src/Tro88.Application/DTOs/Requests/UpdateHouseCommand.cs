using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Constants;
using Tro88.Application.DTOs.Responses;
using Tro88.Application.Interfaces.Services;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Services;

public sealed record UpdateHouseCommand(
    Guid Id,
    string Name,
    string Address,
    string? Province = null,
    string? District = null,
    string? Description = null,
    List<string>? MediaUrls = null) : IRequest<HouseDto>
{
public sealed class Handler
    : IRequestHandler<UpdateHouseCommand, HouseDto>
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
        UpdateHouseCommand request,
        CancellationToken ct)
    {
        var house = await _db.Houses
            .Include(h => h.Rooms)
            .FirstOrDefaultAsync(h => h.Id == request.Id, ct);

        if (house is null)
            throw new NotFoundException(ErrorMessages.HOUSE_NOT_FOUND);

        if (house.OwnerId != _currentUser.UserId &&
            _currentUser.Role != "Admin")
            throw new ForbiddenException(
                ErrorMessages.HOUSE_ACCESS_DENIED);

        house.Update(
            request.Name,
            request.Address,
            request.Province,
            request.District,
            request.Description,
            request.MediaUrls ?? house.MediaUrls);

        await _db.SaveChangesAsync(ct);

        return HouseDto.FromEntity(house);
    }
}
}



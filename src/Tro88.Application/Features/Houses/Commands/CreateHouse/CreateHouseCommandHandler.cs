using MediatR;
using Tro88.Application.Common.Interfaces;
using Tro88.Application.Features.Houses.DTOs;
using Tro88.Domain.Entities;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Features.Houses.Commands.CreateHouse;

public sealed class CreateHouseCommandHandler
    : IRequestHandler<CreateHouseCommand, HouseDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateHouseCommandHandler(
        IApplicationDbContext db,
        ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<HouseDto> Handle(
        CreateHouseCommand request,
        CancellationToken ct)
    {
        if (_currentUser.Role != "Owner" && _currentUser.Role != "Admin")
            throw new ForbiddenException(
                ErrorMessages.HOUSE_ACCESS_DENIED);

        var house = House.Create(
            _currentUser.UserId,
            request.Name,
            request.Address,
            request.Province,
            request.District,
            request.Description);

        _db.Houses.Add(house);
        await _db.SaveChangesAsync(ct);

        return HouseDto.FromEntity(house);
    }
}
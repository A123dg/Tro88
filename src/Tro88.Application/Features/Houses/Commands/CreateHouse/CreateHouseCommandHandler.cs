using MediatR;
using Tro88.Application.Common.Interfaces;
using Tro88.Application.Features.Houses.DTOs;
using Tro88.Domain.Entities;
using Tro88.Domain.Enums;
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
            request.Description,
            request.MediaUrls,
            HouseStatus.PendingApproval);

        _db.Houses.Add(house);

        if (request.Services != null && request.Services.Any())
        {
            foreach (var sInput in request.Services)
            {
                var serviceExists = await _db.Services.AnyAsync(s => s.Id == sInput.ServiceId, ct);
                if (serviceExists)
                {
                    var serviceFee = ServiceFee.Create(house.Id, sInput.ServiceId, sInput.Amount);
                    _db.ServiceFees.Add(serviceFee);
                }
            }
        }

        await _db.SaveChangesAsync(ct);

        return HouseDto.FromEntity(house);
    }
}

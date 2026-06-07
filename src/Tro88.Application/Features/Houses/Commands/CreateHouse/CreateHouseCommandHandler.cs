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
            foreach (var serviceName in request.Services)
            {
                var feeType = "Fixed";
                decimal amount = 0;
                string? unit = "Tháng";

                switch (serviceName.ToLower())
                {
                    case "wifi":
                        amount = 100000;
                        break;
                    case "bãi xe":
                    case "bai xe":
                        amount = 150000;
                        unit = "Xe";
                        break;
                    case "camera":
                        amount = 50000;
                        break;
                    case "máy giặt":
                    case "may giat":
                        amount = 100000;
                        break;
                    case "thang máy":
                    case "thang may":
                        amount = 50000;
                        break;
                }

                var serviceFee = ServiceFee.Create(house.Id, serviceName, feeType, amount, unit);
                _db.ServiceFees.Add(serviceFee);
            }
        }

        await _db.SaveChangesAsync(ct);

        return HouseDto.FromEntity(house);
    }
}

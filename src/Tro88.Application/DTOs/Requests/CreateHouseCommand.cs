using MediatR;
using System.Collections.Generic;
using System;
using Tro88.Application.DTOs.Responses;
using Tro88.Application.Interfaces.Services;
using Tro88.Domain.Entities;
using Tro88.Domain.Enums;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Services;

public record HouseServiceInput(Guid ServiceId, decimal Amount);

public sealed record CreateHouseCommand(
    string Name,
    string Address,
    string? Province = null,
    string? District = null,
    string? Description = null,
    List<string>? MediaUrls = null,
    List<HouseServiceInput>? Services = null) : IRequest<HouseDto>
{
public sealed class Handler
    : IRequestHandler<CreateHouseCommand, HouseDto>
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
}



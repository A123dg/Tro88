using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common.Constants;
using Tro88.Application.Common.Interfaces;
using Tro88.Application.Features.ServiceFees.DTOs;
using Tro88.Domain.Entities;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Features.ServiceFees.Commands.CreateServiceFee;

public sealed class CreateServiceFeeCommandHandler
    : IRequestHandler<CreateServiceFeeCommand, ServiceFeeDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateServiceFeeCommandHandler(
        IApplicationDbContext db,
        ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<ServiceFeeDto> Handle(
        CreateServiceFeeCommand request,
        CancellationToken ct)
    {
        var house = await _db.Houses
            .FirstOrDefaultAsync(h => h.Id == request.HouseId && !h.IsDeleted, ct)
            ?? throw new NotFoundException(ErrorMessages.HOUSE_NOT_FOUND);

        if (house.OwnerId != _currentUser.UserId)
            throw new ForbiddenException(ErrorMessages.ACCESS_DENIED);

        var serviceFee = ServiceFee.Create(
            request.HouseId,
            request.Name,
            request.FeeType,
            request.Amount,
            request.Unit);

        _db.ServiceFees.Add(serviceFee);
        await _db.SaveChangesAsync(ct);

        return ServiceFeeDto.FromEntity(serviceFee);
    }
}

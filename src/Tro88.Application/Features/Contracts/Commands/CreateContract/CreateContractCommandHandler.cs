using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common.Constants;
using Tro88.Application.Common.Interfaces;
using Tro88.Application.Features.Contracts.DTOs;
using Tro88.Domain.Entities;
using Tro88.Domain.Enums;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Features.Contracts.Commands.CreateContract;

public sealed class CreateContractCommandHandler
    : IRequestHandler<CreateContractCommand, ContractDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateContractCommandHandler(
        IApplicationDbContext db,
        ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<ContractDto> Handle(
        CreateContractCommand request,
        CancellationToken ct)
    {
        var room = await _db.Rooms
            .Include(r => r.House)
            .FirstOrDefaultAsync(r => r.Id == request.RoomId, ct);

        if (room is null)
            throw new NotFoundException(ErrorMessages.ROOM_NOT_FOUND);

        if (room.House.OwnerId != _currentUser.UserId &&
            _currentUser.Role != "Admin")
            throw new ForbiddenException(
                ErrorMessages.HOUSE_ACCESS_DENIED);

        if (room.Status == RoomStatus.Occupied)
            throw new BusinessRuleException(
                ErrorMessages.ROOM_ALREADY_OCCUPIED);

        var tenant = await _db.Users
            .FirstOrDefaultAsync(u => u.Id == request.TenantId, ct);

        if (tenant is null)
            throw new NotFoundException(ErrorMessages.USER_NOT_FOUND);

        var contract = Contract.Create(
            request.RoomId,
            request.TenantId,
            room.House.OwnerId,
            request.StartDate,
            request.EndDate,
            request.MonthlyRent,
            request.DepositAmount,
            request.PaymentDay,
            request.Terms);

        _db.Contracts.Add(contract);
        await _db.SaveChangesAsync(ct);

        return ContractDto.FromEntity(contract);
    }
}
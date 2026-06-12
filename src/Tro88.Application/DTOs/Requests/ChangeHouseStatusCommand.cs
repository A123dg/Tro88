using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Constants;
using Tro88.Application.DTOs.Responses;
using Tro88.Application.Interfaces.Services;
using Tro88.Domain.Enums;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Services;

public sealed record ChangeHouseStatusCommand(
    Guid Id,
    string Status) : IRequest<HouseDto>
{
public sealed class Handler
    : IRequestHandler<ChangeHouseStatusCommand, HouseDto>
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

    public async Task<HouseDto> Handle(ChangeHouseStatusCommand request, CancellationToken ct)
    {
        if (_currentUser.Role != "Admin")
            throw new ForbiddenException(ErrorMessages.HOUSE_ACCESS_DENIED);

        if (!Enum.TryParse<HouseStatus>(request.Status, true, out var status))
            throw new BusinessRuleException("Invalid house status");

        var house = await _db.Houses
            .Include(h => h.Rooms)
            .FirstOrDefaultAsync(h => h.Id == request.Id, ct);

        if (house is null)
            throw new NotFoundException(ErrorMessages.HOUSE_NOT_FOUND);

        house.ChangeStatus(status);
        await _db.SaveChangesAsync(ct);

        return HouseDto.FromEntity(house);
    }
}
}



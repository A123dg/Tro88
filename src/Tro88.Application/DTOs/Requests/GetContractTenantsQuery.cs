using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Constants;
using Tro88.Application.Interfaces.Services;
using Tro88.Application.DTOs.Responses;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Features.Contracts.Queries.GetContractTenants;

public record GetContractTenantsQuery(Guid ContractId)
    : IRequest<List<TenantInRoomDto>>
{
public class Handler
    : IRequestHandler<GetContractTenantsQuery, List<TenantInRoomDto>>
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

    public async Task<List<TenantInRoomDto>> Handle(
        GetContractTenantsQuery request,
        CancellationToken ct)
    {
        var contract = await _db.Contracts
            .Include(c => c.Room)
                .ThenInclude(r => r.House)
            .FirstOrDefaultAsync(c =>
                c.Id == request.ContractId && !c.IsDeleted, ct)
            ?? throw new NotFoundException(ErrorMessages.CONTRACT_NOT_FOUND);

        if (contract.Room.House.OwnerId != _currentUser.UserId &&
            contract.TenantId != _currentUser.UserId &&
            _currentUser.Role != "Admin")
            throw new ForbiddenException(ErrorMessages.ACCESS_DENIED);

        var tenants = await _db.TenantInRooms
            .AsNoTracking()
            .Include(t => t.User)
            .Where(t => t.ContractId == request.ContractId)
            .ToListAsync(ct);

        return tenants.Select(TenantInRoomDto.FromEntity).ToList();
    }
}
}




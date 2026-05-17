using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common.Interfaces;
using Tro88.Application.Features.Contracts.DTOs;

namespace Tro88.Application.Features.Contracts.Queries.GetContractById;

public record GetContractByIdQuery(Guid Id) : IRequest<ContractDto?>;

public class GetContractByIdQueryHandler
    : IRequestHandler<GetContractByIdQuery, ContractDto?>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetContractByIdQueryHandler(
        IApplicationDbContext db,
        ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<ContractDto?> Handle(
        GetContractByIdQuery request,
        CancellationToken ct)
    {
        var contract = await _db.Contracts
            .Include(c => c.Room)
            .ThenInclude(r => r.House)
            .Include(c => c.Tenant)
            .FirstOrDefaultAsync(c => c.Id == request.Id && !c.IsDeleted, ct);

        if (contract is null)
            return null;

        if (contract.TenantId != _currentUser.UserId &&
            contract.OwnerId != _currentUser.UserId)
            return null;

        return ContractDto.FromEntity(contract);
    }
}
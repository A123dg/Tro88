using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Interfaces.Services;
using Tro88.Application.DTOs.Responses;

namespace Tro88.Application.Features.Contracts.Queries.GetContractById;

public record GetContractByIdQuery(Guid Id) : IRequest<ContractDto?>
{
public class Handler
    : IRequestHandler<GetContractByIdQuery, ContractDto?>
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
}




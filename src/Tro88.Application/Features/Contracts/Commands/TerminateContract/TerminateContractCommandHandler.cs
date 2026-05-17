using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common.Constants;
using Tro88.Application.Common.Interfaces;
using Tro88.Application.Features.Contracts.DTOs;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Features.Contracts.Commands.TerminateContract;

public sealed class TerminateContractCommandHandler
    : IRequestHandler<TerminateContractCommand, ContractDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public TerminateContractCommandHandler(
        IApplicationDbContext db,
        ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<ContractDto> Handle(
        TerminateContractCommand request,
        CancellationToken ct)
    {
        var contract = await _db.Contracts
            .Include(c => c.Room)
            .Include(c => c.Tenant)
            .FirstOrDefaultAsync(c => c.Id == request.Id, ct);

        if (contract is null)
            throw new NotFoundException(
                ErrorMessages.CONTRACT_NOT_FOUND);

        if (contract.OwnerId != _currentUser.UserId &&
            contract.TenantId != _currentUser.UserId &&
            _currentUser.Role != "Admin")
            throw new ForbiddenException(
                ErrorMessages.ACCESS_DENIED);

        try
        {
            contract.Terminate(request.Reason);
            await _db.SaveChangesAsync(ct);
        }
        catch (DomainException ex)
        {
            throw new BusinessRuleException(
                ErrorMessages.CONTRACT_ALREADY_TERMINATED);
        }

        return ContractDto.FromEntity(contract);
    }
}
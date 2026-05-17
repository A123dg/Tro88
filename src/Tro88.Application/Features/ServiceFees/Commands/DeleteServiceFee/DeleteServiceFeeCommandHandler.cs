using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common.Constants;
using Tro88.Application.Common.Interfaces;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Features.ServiceFees.Commands.DeleteServiceFee;

public sealed class DeleteServiceFeeCommandHandler
    : IRequestHandler<DeleteServiceFeeCommand, Unit>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public DeleteServiceFeeCommandHandler(
        IApplicationDbContext db,
        ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Unit> Handle(
        DeleteServiceFeeCommand request,
        CancellationToken ct)
    {
        var serviceFee = await _db.ServiceFees
            .Include(sf => sf.House)
            .FirstOrDefaultAsync(sf => sf.Id == request.Id, ct)
            ?? throw new NotFoundException(ErrorMessages.SERVICE_FEE_NOT_FOUND);

        if (serviceFee.House.OwnerId != _currentUser.UserId)
            throw new ForbiddenException(ErrorMessages.ACCESS_DENIED);

        _db.ServiceFees.Remove(serviceFee);
        await _db.SaveChangesAsync(ct);

        return Unit.Value;
    }
}

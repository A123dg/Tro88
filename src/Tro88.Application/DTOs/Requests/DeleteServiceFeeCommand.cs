using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Constants;
using Tro88.Application.Interfaces.Services;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Services;

public record DeleteServiceFeeCommand(Guid Id) : IRequest<Unit>
{
public sealed class Handler
    : IRequestHandler<DeleteServiceFeeCommand, Unit>
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
}



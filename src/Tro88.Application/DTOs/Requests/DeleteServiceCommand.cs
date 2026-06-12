using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Interfaces.Services;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Services;

public record DeleteServiceCommand(Guid Id) : IRequest<Unit>
{
public sealed class Handler
    : IRequestHandler<DeleteServiceCommand, Unit>
{
    private readonly IAppDbContext _db;

    public Handler(IAppDbContext db) => _db = db;

    public async Task<Unit> Handle(
        DeleteServiceCommand request,
        CancellationToken ct)
    {
        var service = await _db.Services
            .FirstOrDefaultAsync(s => s.Id == request.Id, ct)
            ?? throw new NotFoundException("Service not found in catalog");

        var inUse = await _db.ServiceFees.AnyAsync(sf => sf.ServiceId == request.Id, ct)
            || await _db.RoomServiceFees.AnyAsync(rs => rs.ServiceId == request.Id, ct);

        if (inUse)
            throw new DomainException("Cannot delete service because it is in use by one or more houses or rooms.");

        _db.Services.Remove(service);
        await _db.SaveChangesAsync(ct);

        return Unit.Value;
    }
}
}



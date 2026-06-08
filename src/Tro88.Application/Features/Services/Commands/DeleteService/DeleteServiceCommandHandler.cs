using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common.Interfaces;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Features.Services.Commands.DeleteService;

public sealed class DeleteServiceCommandHandler
    : IRequestHandler<DeleteServiceCommand, Unit>
{
    private readonly IApplicationDbContext _db;

    public DeleteServiceCommandHandler(IApplicationDbContext db) => _db = db;

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

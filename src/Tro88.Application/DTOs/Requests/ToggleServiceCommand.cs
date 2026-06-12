using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.DTOs.Responses;
using Tro88.Application.Interfaces.Services;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Services;

public record ToggleServiceCommand(Guid Id) : IRequest<ServiceDto>
{
public sealed class Handler
    : IRequestHandler<ToggleServiceCommand, ServiceDto>
{
    private readonly IAppDbContext _db;

    public Handler(IAppDbContext db) => _db = db;

    public async Task<ServiceDto> Handle(
        ToggleServiceCommand request,
        CancellationToken ct)
    {
        var service = await _db.Services
            .FirstOrDefaultAsync(s => s.Id == request.Id, ct)
            ?? throw new NotFoundException("Service not found in catalog");

        service.Toggle();
        await _db.SaveChangesAsync(ct);

        return ServiceDto.FromEntity(service);
    }
}
}



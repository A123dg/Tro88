using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common.Interfaces;
using Tro88.Application.Features.Services.DTOs;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Features.Services.Commands.ToggleService;

public sealed class ToggleServiceCommandHandler
    : IRequestHandler<ToggleServiceCommand, ServiceDto>
{
    private readonly IApplicationDbContext _db;

    public ToggleServiceCommandHandler(IApplicationDbContext db) => _db = db;

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

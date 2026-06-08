using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common.Interfaces;
using Tro88.Application.Features.Services.DTOs;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Features.Services.Commands.UpdateService;

public sealed class UpdateServiceCommandHandler
    : IRequestHandler<UpdateServiceCommand, ServiceDto>
{
    private readonly IApplicationDbContext _db;

    public UpdateServiceCommandHandler(IApplicationDbContext db) => _db = db;

    public async Task<ServiceDto> Handle(
        UpdateServiceCommand request,
        CancellationToken ct)
    {
        var service = await _db.Services
            .FirstOrDefaultAsync(s => s.Id == request.Id, ct)
            ?? throw new NotFoundException("Service not found in catalog");

        var duplicateExists = await _db.Services.AnyAsync(
            s => s.Id != request.Id && s.Name.ToLower() == request.Name.ToLower(), ct);

        if (duplicateExists)
            throw new DomainException($"Another service with the name '{request.Name}' already exists.");

        service.Update(request.Name, request.FeeType, request.Unit);
        await _db.SaveChangesAsync(ct);

        return ServiceDto.FromEntity(service);
    }
}

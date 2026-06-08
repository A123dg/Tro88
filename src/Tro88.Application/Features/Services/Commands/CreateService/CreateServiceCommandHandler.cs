using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common.Interfaces;
using Tro88.Application.Features.Services.DTOs;
using Tro88.Domain.Entities;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Features.Services.Commands.CreateService;

public sealed class CreateServiceCommandHandler
    : IRequestHandler<CreateServiceCommand, ServiceDto>
{
    private readonly IApplicationDbContext _db;

    public CreateServiceCommandHandler(IApplicationDbContext db) => _db = db;

    public async Task<ServiceDto> Handle(
        CreateServiceCommand request,
        CancellationToken ct)
    {
        var exists = await _db.Services.AnyAsync(
            s => s.Name.ToLower() == request.Name.ToLower(), ct);

        if (exists)
            throw new DomainException($"Service '{request.Name}' already exists in global catalog.");

        var service = Service.Create(request.Name, request.FeeType, request.Unit);
        _db.Services.Add(service);
        await _db.SaveChangesAsync(ct);

        return ServiceDto.FromEntity(service);
    }
}

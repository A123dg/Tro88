using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Constants;
using Tro88.Application.DTOs.Responses;
using Tro88.Application.Interfaces.Services;
using Tro88.Domain.Entities;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Services;

public record CreateServiceFeeCommand(
    Guid HouseId,
    Guid ServiceId,
    decimal Amount) : IRequest<ServiceFeeDto>
{
public class Handler : IRequestHandler<CreateServiceFeeCommand, ServiceFeeDto>
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public Handler(IAppDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<ServiceFeeDto> Handle(CreateServiceFeeCommand request, CancellationToken ct)
    {
        var house = await _db.Houses
            .FirstOrDefaultAsync(h => h.Id == request.HouseId && !h.IsDeleted, ct)
            ?? throw new NotFoundException(ErrorMessages.HOUSE_NOT_FOUND);

        if (house.OwnerId != _currentUser.UserId)
            throw new ForbiddenException(ErrorMessages.ACCESS_DENIED);

        var serviceExists = await _db.Services
            .AnyAsync(s => s.Id == request.ServiceId && s.IsActive, ct);
        if (!serviceExists)
            throw new NotFoundException("Service not found in global catalog or is inactive");

        // Check if already configured for this house
        var existing = await _db.ServiceFees
            .FirstOrDefaultAsync(sf => sf.HouseId == request.HouseId && sf.ServiceId == request.ServiceId, ct);

        if (existing != null)
        {
            existing.Update(request.Amount);
            if (!existing.IsActive)
                existing.Toggle(); // Reactivate if it was toggled off
            await _db.SaveChangesAsync(ct);

            var updatedFee = await _db.ServiceFees
                .Include(sf => sf.Service)
                .FirstAsync(sf => sf.Id == existing.Id, ct);
            return ServiceFeeDto.FromEntity(updatedFee);
        }

        var serviceFee = ServiceFee.Create(request.HouseId, request.ServiceId, request.Amount);
        _db.ServiceFees.Add(serviceFee);
        await _db.SaveChangesAsync(ct);

        var savedFee = await _db.ServiceFees
            .Include(sf => sf.Service)
            .FirstAsync(sf => sf.Id == serviceFee.Id, ct);

        return ServiceFeeDto.FromEntity(savedFee);
    }
}
}



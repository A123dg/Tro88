using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common.Constants;
using Tro88.Application.Common.Interfaces;
using Tro88.Application.Features.ServiceFees.DTOs;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Features.ServiceFees.Commands.UpdateServiceFee;

public class UpdateServiceFeeCommandHandler : IRequestHandler<UpdateServiceFeeCommand, ServiceFeeDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public UpdateServiceFeeCommandHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<ServiceFeeDto> Handle(UpdateServiceFeeCommand request, CancellationToken ct)
    {
        var serviceFee = await _db.ServiceFees
            .Include(sf => sf.House)
            .Include(sf => sf.Service)
            .FirstOrDefaultAsync(sf => sf.Id == request.Id, ct)
            ?? throw new NotFoundException(ErrorMessages.SERVICE_FEE_NOT_FOUND);

        if (serviceFee.House.OwnerId != _currentUser.UserId)
            throw new ForbiddenException(ErrorMessages.ACCESS_DENIED);

        serviceFee.Update(request.Amount);

        await _db.SaveChangesAsync(ct);
        return ServiceFeeDto.FromEntity(serviceFee);
    }
}

using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common.Constants;
using Tro88.Application.Common.Interfaces;
using Tro88.Application.Features.Contracts.DTOs;
using Tro88.Domain.Entities;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Features.Contracts.Commands.ActivateContract;

public sealed class ActivateContractCommandHandler
    : IRequestHandler<ActivateContractCommand, ContractDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IEmailService _emailService;
    private readonly INotificationService _notificationService;

    public ActivateContractCommandHandler(
        IApplicationDbContext db,
        ICurrentUserService currentUser,
        IEmailService emailService,
        INotificationService notificationService)
    {
        _db = db;
        _currentUser = currentUser;
        _emailService = emailService;
        _notificationService = notificationService;
    }

    public async Task<ContractDto> Handle(
        ActivateContractCommand request,
        CancellationToken ct)
    {
        var contract = await _db.Contracts
            .Include(c => c.Room)
                .ThenInclude(r => r.House)
            .Include(c => c.Tenant)
            .FirstOrDefaultAsync(c => c.Id == request.Id, ct);

        if (contract is null)
            throw new NotFoundException(
                ErrorMessages.CONTRACT_NOT_FOUND);

        if (contract.OwnerId != _currentUser.UserId &&
            contract.TenantId != _currentUser.UserId &&
            _currentUser.Role != "Admin")
            throw new ForbiddenException(
                ErrorMessages.ACCESS_DENIED);

        try
        {
            var statusBefore = contract.Status;

            if (_currentUser.Role == "Admin")
            {
                contract.Activate();
            }
            else if (_currentUser.UserId == contract.TenantId)
            {
                contract.SignByTenant();
            }
            else if (_currentUser.UserId == contract.OwnerId)
            {
                contract.SignByOwner();
            }

            if (contract.Status == Domain.Enums.ContractStatus.Active && statusBefore != Domain.Enums.ContractStatus.Active)
            {
                // Update room status
                contract.Room.ChangeStatus(Domain.Enums.RoomStatus.Occupied);

                // Add tenant to room
                var occupant = TenantInRoom.Create(contract.Id, contract.TenantId, contract.RoomId, contract.Room.HouseId, contract.StartDate);
                _db.TenantInRooms.Add(occupant);

                // Fetch owner to send email
                var owner = await _db.Users.FindAsync(new object[] { contract.OwnerId }, ct);

                try
                {
                    if (owner is not null && !string.IsNullOrWhiteSpace(owner.Email))
                    {
                        await _emailService.SendContractSignedConfirmationAsync(
                            owner.Email,
                            owner.FullName,
                            contract.ContractCode,
                            contract.Room.RoomNumber,
                            contract.Room.House.Name,
                            ct);
                    }

                    if (!string.IsNullOrWhiteSpace(contract.Tenant.Email))
                    {
                        await _emailService.SendContractSignedConfirmationAsync(
                            contract.Tenant.Email,
                            contract.Tenant.FullName,
                            contract.ContractCode,
                            contract.Room.RoomNumber,
                            contract.Room.House.Name,
                            ct);
                    }
                }
                catch
                {
                    // Ignore email sending failures
                }

                // Send in-app notifications
                await _notificationService.SendAsync(
                    contract.TenantId,
                    "CONTRACT_ACTIVATED",
                    $"Hợp đồng thuê phòng {contract.Room.RoomNumber} đã được cả 2 bên xác nhận ký.",
                    "contract",
                    contract.Id,
                    ct);

                if (owner is not null)
                {
                    await _notificationService.SendAsync(
                        owner.Id,
                        "CONTRACT_ACTIVATED",
                        $"Hợp đồng phòng {contract.Room.RoomNumber} đã được ký và kích hoạt.",
                        "contract",
                        contract.Id,
                        ct);
                }
            }

            await _db.SaveChangesAsync(ct);
        }
        catch (DomainException ex)
        {
            throw new BusinessRuleException(ex.Message);
        }

        return ContractDto.FromEntity(contract);
    }
}
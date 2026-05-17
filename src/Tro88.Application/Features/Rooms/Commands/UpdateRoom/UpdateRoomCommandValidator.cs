using FluentValidation;
using Tro88.Application.Common.Constants;

namespace Tro88.Application.Features.Rooms.Commands.UpdateRoom;

public sealed class UpdateRoomCommandValidator
    : AbstractValidator<UpdateRoomCommand>
{
    public UpdateRoomCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage(ErrorMessages.COMMON_422);

        RuleFor(x => x.RoomNumber)
            .NotEmpty()
            .WithMessage(ErrorMessages.COMMON_422)
            .MaximumLength(20);

        RuleFor(x => x.Floor)
            .GreaterThanOrEqualTo(0)
            .WithMessage(ErrorMessages.COMMON_422);

        RuleFor(x => x.Area)
            .GreaterThan(0)
            .WithMessage(ErrorMessages.COMMON_422);

        RuleFor(x => x.MaxOccupants)
            .GreaterThan(0)
            .WithMessage(ErrorMessages.COMMON_422);

        RuleFor(x => x.MonthlyRent)
            .GreaterThan(0)
            .WithMessage(ErrorMessages.COMMON_422);

        RuleFor(x => x.DepositAmount)
            .GreaterThanOrEqualTo(0)
            .WithMessage(ErrorMessages.COMMON_422);

        RuleFor(x => x.ElectricityUnitPrice)
            .GreaterThanOrEqualTo(0)
            .WithMessage(ErrorMessages.COMMON_422);

        RuleFor(x => x.WaterUnitPrice)
            .GreaterThanOrEqualTo(0)
            .WithMessage(ErrorMessages.COMMON_422);

        RuleFor(x => x.Description)
            .MaximumLength(1000);
    }
}
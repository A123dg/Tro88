using FluentValidation;
using Tro88.Application.Common.Constants;

namespace Tro88.Application.Features.Contracts.Commands.CreateContract;

public sealed class CreateContractCommandValidator
    : AbstractValidator<CreateContractCommand>
{
    public CreateContractCommandValidator()
    {
        RuleFor(x => x.RoomId)
            .NotEmpty()
            .WithMessage(ErrorMessages.COMMON_422);

        RuleFor(x => x.TenantId)
            .NotEmpty()
            .WithMessage(ErrorMessages.COMMON_422);

        RuleFor(x => x.StartDate)
            .NotEmpty()
            .WithMessage(ErrorMessages.COMMON_422);

        RuleFor(x => x.EndDate)
            .NotEmpty()
            .WithMessage(ErrorMessages.COMMON_422)
            .GreaterThan(x => x.StartDate)
            .WithMessage(ErrorMessages.COMMON_422);

        RuleFor(x => x.MonthlyRent)
            .GreaterThan(0)
            .WithMessage(ErrorMessages.COMMON_422);

        RuleFor(x => x.DepositAmount)
            .GreaterThanOrEqualTo(0)
            .WithMessage(ErrorMessages.COMMON_422);

        RuleFor(x => x.PaymentDay)
            .InclusiveBetween(1, 28)
            .WithMessage(ErrorMessages.COMMON_422);
    }
}
using FluentValidation;
using Tro88.Application.Common.Constants;

namespace Tro88.Application.Features.ServiceFees.Commands.CreateServiceFee;

public class CreateServiceFeeCommandValidator
    : AbstractValidator<CreateServiceFeeCommand>
{
    public CreateServiceFeeCommandValidator()
    {
        RuleFor(x => x.HouseId)
            .NotEmpty()
            .WithMessage(ErrorMessages.COMMON_422);

        RuleFor(x => x.ServiceId)
            .NotEmpty()
            .WithMessage(ErrorMessages.COMMON_422);

        RuleFor(x => x.Amount)
            .GreaterThanOrEqualTo(0)
            .WithMessage(ErrorMessages.COMMON_422);
    }
}
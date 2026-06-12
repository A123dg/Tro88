using FluentValidation;
using Tro88.Application.Constants;

namespace Tro88.Application.Services;

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

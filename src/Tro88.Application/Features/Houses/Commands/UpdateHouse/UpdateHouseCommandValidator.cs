using FluentValidation;
using Tro88.Application.Common.Constants;

namespace Tro88.Application.Features.Houses.Commands.UpdateHouse;

public sealed class UpdateHouseCommandValidator
    : AbstractValidator<UpdateHouseCommand>
{
    public UpdateHouseCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage(ErrorMessages.COMMON_422);

        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage(ErrorMessages.COMMON_422)
            .MaximumLength(100);

        RuleFor(x => x.Address)
            .NotEmpty()
            .WithMessage(ErrorMessages.COMMON_422)
            .MaximumLength(500);

        RuleFor(x => x.Province)
            .MaximumLength(100);

        RuleFor(x => x.District)
            .MaximumLength(100);

        RuleFor(x => x.Description)
            .MaximumLength(1000);
    }
}
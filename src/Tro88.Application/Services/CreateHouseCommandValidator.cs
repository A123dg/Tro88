using FluentValidation;
using Tro88.Application.Constants;

namespace Tro88.Application.Services;

public sealed class CreateHouseCommandValidator
    : AbstractValidator<CreateHouseCommand>
{
    public CreateHouseCommandValidator()
    {
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

        RuleForEach(x => x.MediaUrls)
            .MaximumLength(1000);
    }
}


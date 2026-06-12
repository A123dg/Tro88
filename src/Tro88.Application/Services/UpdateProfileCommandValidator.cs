using FluentValidation;
using Tro88.Application.Constants;

namespace Tro88.Application.Services;

public class UpdateProfileCommandValidator
    : AbstractValidator<UpdateProfileCommand>
{
    public UpdateProfileCommandValidator()
    {
        RuleFor(x => x.FullName)
            .NotEmpty()
            .WithMessage(ErrorMessages.COMMON_422);
    }
}


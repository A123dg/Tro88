using FluentValidation;
using Tro88.Application.Constants;

namespace Tro88.Application.Services;

public class ChangePasswordCommandValidator
    : AbstractValidator<ChangePasswordCommand>
{
    public ChangePasswordCommandValidator()
    {
        RuleFor(x => x.CurrentPassword)
            .NotEmpty()
            .WithMessage(ErrorMessages.COMMON_422);
        RuleFor(x => x.NewPassword)
            .NotEmpty()
            .MinimumLength(6)
            .WithMessage(ErrorMessages.COMMON_422);
    }
}


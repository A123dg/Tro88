using FluentValidation;
using Tro88.Application.Constants;

namespace Tro88.Application.Services;

public sealed class LoginCommandValidator
    : AbstractValidator<LoginCommand>
{
    public LoginCommandValidator()
    {
        RuleFor(x => x.Username)
            .NotEmpty()
            .WithMessage(ErrorMessages.COMMON_422);

        RuleFor(x => x.Password)
            .NotEmpty()
            .WithMessage(ErrorMessages.COMMON_422);
    }
}


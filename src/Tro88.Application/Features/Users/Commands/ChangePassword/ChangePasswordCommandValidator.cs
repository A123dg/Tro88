using FluentValidation;
using Tro88.Application.Common.Constants;

namespace Tro88.Application.Features.Users.Commands.ChangePassword;

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

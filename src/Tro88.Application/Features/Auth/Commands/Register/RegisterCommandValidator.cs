using FluentValidation;
using Tro88.Application.Common.Constants;

namespace Tro88.Application.Features.Auth.Commands.Register;

public sealed class RegisterCommandValidator
    : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator()
    {
        RuleFor(x => x.FullName)
            .NotEmpty()
            .WithMessage(ErrorMessages.COMMON_422)
            .MaximumLength(100);

        RuleFor(x => x.Email)
            .NotEmpty()
            .WithMessage(ErrorMessages.COMMON_422)
            .EmailAddress()
            .WithMessage(ErrorMessages.COMMON_422);

        RuleFor(x => x.PhoneNumber)
            .NotEmpty()
            .WithMessage(ErrorMessages.COMMON_422)
            .Matches(@"^\+?[0-9]{10,15}$")
            .WithMessage(ErrorMessages.COMMON_422);

        RuleFor(x => x.Password)
            .NotEmpty()
            .WithMessage(ErrorMessages.COMMON_422)
            .MinimumLength(6)
            .WithMessage(ErrorMessages.COMMON_422);

        RuleFor(x => x.Role)
            .NotEmpty()
            .WithMessage(ErrorMessages.COMMON_422)
            .Must(r => new[] { "Owner", "Tenant", "Admin" }
                .Contains(r))
            .WithMessage(ErrorMessages.COMMON_422);
    }
}
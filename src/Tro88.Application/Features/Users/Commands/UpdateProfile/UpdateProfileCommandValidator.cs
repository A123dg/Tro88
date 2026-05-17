using FluentValidation;
using Tro88.Application.Common.Constants;

namespace Tro88.Application.Features.Users.Commands.UpdateProfile;

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

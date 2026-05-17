using FluentValidation;
using Tro88.Application.Common.Constants;

namespace Tro88.Application.Features.AiAgent.Commands.SendMessage;

public class SendMessageCommandValidator
    : AbstractValidator<SendMessageCommand>
{
    public SendMessageCommandValidator()
    {
        RuleFor(x => x.Content)
            .NotEmpty()
            .WithMessage(ErrorMessages.COMMON_422);
    }
}

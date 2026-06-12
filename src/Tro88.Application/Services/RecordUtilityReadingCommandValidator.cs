using FluentValidation;
using Tro88.Application.Constants;

namespace Tro88.Application.Services;

public class RecordUtilityReadingCommandValidator
    : AbstractValidator<RecordUtilityReadingCommand>
{
    public RecordUtilityReadingCommandValidator()
    {
        RuleFor(x => x.RoomId)
            .NotEmpty()
            .WithMessage(ErrorMessages.COMMON_422);
        RuleFor(x => x.Month)
            .InclusiveBetween(1, 12)
            .WithMessage(ErrorMessages.COMMON_422);
        RuleFor(x => x.Year)
            .GreaterThan(2000)
            .WithMessage(ErrorMessages.COMMON_422);
        RuleFor(x => x.ElectricityNew)
            .GreaterThanOrEqualTo(0)
            .WithMessage(ErrorMessages.COMMON_422);
        RuleFor(x => x.WaterNew)
            .GreaterThanOrEqualTo(0)
            .WithMessage(ErrorMessages.COMMON_422);
    }
}


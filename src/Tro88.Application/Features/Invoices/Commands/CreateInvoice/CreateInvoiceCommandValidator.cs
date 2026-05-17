using FluentValidation;
using Tro88.Application.Common.Constants;

namespace Tro88.Application.Features.Invoices.Commands.CreateInvoice;

public class CreateInvoiceCommandValidator : AbstractValidator<CreateInvoiceCommand>
{
    public CreateInvoiceCommandValidator()
    {
        RuleFor(x => x.ContractId).NotEmpty()
            .WithMessage(ErrorMessages.COMMON_422);
        RuleFor(x => x.RoomId).NotEmpty()
            .WithMessage(ErrorMessages.COMMON_422);
        RuleFor(x => x.Month).InclusiveBetween(1, 12)
            .WithMessage(ErrorMessages.COMMON_422);
        RuleFor(x => x.Year).InclusiveBetween(2000, 2100)
            .WithMessage(ErrorMessages.COMMON_422);
        RuleFor(x => x.DueDate).NotEmpty()
            .WithMessage(ErrorMessages.COMMON_422);
    }
}
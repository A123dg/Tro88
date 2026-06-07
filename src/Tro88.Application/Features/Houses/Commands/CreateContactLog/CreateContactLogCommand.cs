using MediatR;

namespace Tro88.Application.Features.Houses.Commands.CreateContactLog;

public sealed record CreateContactLogCommand(Guid HouseId, string ContactType) : IRequest<ContactLogResponseDto>;

public sealed record ContactLogResponseDto(string PhoneNumber);

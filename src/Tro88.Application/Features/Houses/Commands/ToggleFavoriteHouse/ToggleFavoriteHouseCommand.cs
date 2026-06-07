using MediatR;

namespace Tro88.Application.Features.Houses.Commands.ToggleFavoriteHouse;

public sealed record ToggleFavoriteHouseCommand(Guid HouseId) : IRequest<ToggleFavoriteHouseResponseDto>;

public sealed record ToggleFavoriteHouseResponseDto(bool IsFavorite);

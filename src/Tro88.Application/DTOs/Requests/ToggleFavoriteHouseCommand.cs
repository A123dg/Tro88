using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Interfaces.Services;
using Tro88.Domain.Entities;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Services;

public sealed record ToggleFavoriteHouseCommand(Guid HouseId) : IRequest<ToggleFavoriteHouseResponseDto>
{
public sealed class Handler : IRequestHandler<ToggleFavoriteHouseCommand, ToggleFavoriteHouseResponseDto>
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public Handler(IAppDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<ToggleFavoriteHouseResponseDto> Handle(ToggleFavoriteHouseCommand request, CancellationToken ct)
    {
        if (!_currentUser.IsAuthenticated)
        {
            throw new DomainException("Vui lòng đăng nhập để thực hiện chức năng quan tâm phòng");
        }

        var houseExists = await _db.Houses.AnyAsync(h => h.Id == request.HouseId, ct);
        if (!houseExists)
        {
            throw new NotFoundException("Không tìm thấy nhà trọ");
        }

        var favorite = await _db.FavoriteHouses
            .FirstOrDefaultAsync(fh => fh.UserId == _currentUser.UserId && fh.HouseId == request.HouseId, ct);

        if (favorite != null)
        {
            _db.FavoriteHouses.Remove(favorite);
            await _db.SaveChangesAsync(ct);
            return new ToggleFavoriteHouseResponseDto(false);
        }
        else
        {
            var newFavorite = FavoriteHouse.Create(_currentUser.UserId, request.HouseId);
            _db.FavoriteHouses.Add(newFavorite);
            await _db.SaveChangesAsync(ct);
            return new ToggleFavoriteHouseResponseDto(true);
        }
    }
}
}

public sealed record ToggleFavoriteHouseResponseDto(bool IsFavorite);



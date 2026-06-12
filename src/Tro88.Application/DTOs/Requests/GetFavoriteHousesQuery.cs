using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.DTOs.Responses;
using Tro88.Application.Interfaces.Services;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Services;

public sealed record GetFavoriteHousesQuery : IRequest<List<HouseDto>>
{
public sealed class Handler : IRequestHandler<GetFavoriteHousesQuery, List<HouseDto>>
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public Handler(IAppDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<List<HouseDto>> Handle(GetFavoriteHousesQuery request, CancellationToken ct)
    {
        if (!_currentUser.IsAuthenticated)
        {
            throw new DomainException("Vui lòng đăng nhập");
        }

        var houses = await _db.FavoriteHouses
            .Where(fh => fh.UserId == _currentUser.UserId)
            .Include(fh => fh.House)
                .ThenInclude(h => h.Rooms)
            .Select(fh => fh.House)
            .ToListAsync(ct);

        return houses.Select(HouseDto.FromEntity).ToList();
    }
}
}



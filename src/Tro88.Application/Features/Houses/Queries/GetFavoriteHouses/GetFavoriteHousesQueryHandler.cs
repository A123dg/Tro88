using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common.Interfaces;
using Tro88.Application.Features.Houses.DTOs;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Features.Houses.Queries.GetFavoriteHouses;

public sealed class GetFavoriteHousesQueryHandler : IRequestHandler<GetFavoriteHousesQuery, List<HouseDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetFavoriteHousesQueryHandler(IApplicationDbContext db, ICurrentUserService currentUser)
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

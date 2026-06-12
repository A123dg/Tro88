using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using System.Threading;
using System;
using Tro88.Application.DTOs.Responses;
using Tro88.Application.Interfaces.Services;
using Tro88.Domain.Enums;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Services;

public sealed record GetPublicHouseDetailQuery(Guid Id) : IRequest<PublicHouseDetailDto>
{
public sealed class Handler
    : IRequestHandler<GetPublicHouseDetailQuery, PublicHouseDetailDto>
{
    private readonly IAppDbContext _db;

    public Handler(IAppDbContext db)
    {
        _db = db;
    }

    public async Task<PublicHouseDetailDto> Handle(
        GetPublicHouseDetailQuery request,
        CancellationToken ct)
    {
        var houseDto = await _db.Houses
            .Where(h => h.Id == request.Id && h.Status == HouseStatus.Active)
            .Select(h => new PublicHouseDetailDto
            {
                Id = h.Id,
                Name = h.Name,
                Address = h.Address,
                Description = h.Description,
                MediaUrls = h.MediaUrls,
                PriceFrom = h.Rooms.Any() ? h.Rooms.Min(r => r.MonthlyRent) : 0,
                Owner = new PublicHouseOwnerDto
                {
                    Id = h.Owner.Id,
                    FullName = h.Owner.FullName,
                    PhoneNumber = h.Owner.PhoneNumber,
                    AvatarUrl = h.Owner.AvatarUrl
                }
            })
            .FirstOrDefaultAsync(ct);

        if (houseDto is null)
            throw new NotFoundException("Không tìm thấy nhà trọ hoặc nhà trọ chưa được kích hoạt");

        return houseDto;
    }
}
}



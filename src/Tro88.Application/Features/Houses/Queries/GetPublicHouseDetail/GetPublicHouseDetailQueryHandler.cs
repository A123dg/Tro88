using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common.Interfaces;
using Tro88.Application.Features.Houses.DTOs;
using Tro88.Domain.Enums;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Features.Houses.Queries.GetPublicHouseDetail;

public sealed class GetPublicHouseDetailQueryHandler
    : IRequestHandler<GetPublicHouseDetailQuery, PublicHouseDetailDto>
{
    private readonly IApplicationDbContext _db;

    public GetPublicHouseDetailQueryHandler(IApplicationDbContext db)
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

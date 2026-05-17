using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common.Constants;
using Tro88.Application.Common.Interfaces;
using Tro88.Application.Features.UtilityReadings.DTOs;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Features.UtilityReadings.Queries.GetUtilityReadingById;

public record GetUtilityReadingByIdQuery(Guid Id) : IRequest<UtilityReadingDto>;

public class GetUtilityReadingByIdQueryHandler
    : IRequestHandler<GetUtilityReadingByIdQuery, UtilityReadingDto>
{
    private readonly IApplicationDbContext _db;

    public GetUtilityReadingByIdQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<UtilityReadingDto> Handle(
        GetUtilityReadingByIdQuery request,
        CancellationToken ct)
    {
        var reading = await _db.UtilityReadings
            .AsNoTracking()
            .Include(r => r.Room)
            .FirstOrDefaultAsync(r => r.Id == request.Id, ct)
            ?? throw new NotFoundException(ErrorMessages.UTILITY_READING_NOT_FOUND);

        return UtilityReadingDto.FromEntity(reading);
    }
}

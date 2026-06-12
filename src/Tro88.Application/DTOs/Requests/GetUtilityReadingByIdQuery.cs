using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Constants;
using Tro88.Application.Interfaces.Services;
using Tro88.Application.DTOs.Responses;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Services;

public record GetUtilityReadingByIdQuery(Guid Id) : IRequest<UtilityReadingDto>
{
public class Handler
    : IRequestHandler<GetUtilityReadingByIdQuery, UtilityReadingDto>
{
    private readonly IAppDbContext _db;

    public Handler(IAppDbContext db) => _db = db;

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
}




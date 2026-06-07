using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common.Interfaces;
using Tro88.Domain.Entities;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Features.Houses.Commands.CreateContactLog;

public sealed class CreateContactLogCommandHandler : IRequestHandler<CreateContactLogCommand, ContactLogResponseDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateContactLogCommandHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<ContactLogResponseDto> Handle(CreateContactLogCommand request, CancellationToken ct)
    {
        // Phải đăng nhập mới ghi nhận lượt liên hệ được, hoặc nếu không đăng nhập thì dùng Guid.Empty hay ném lỗi?
        // Theo luồng thao tác: Người dùng đăng nhập.
        if (!_currentUser.IsAuthenticated)
        {
            throw new DomainException("Vui lòng đăng nhập để thực hiện liên hệ");
        }

        var house = await _db.Houses
            .Include(h => h.Owner)
            .FirstOrDefaultAsync(h => h.Id == request.HouseId, ct);

        if (house == null)
        {
            throw new NotFoundException("Không tìm thấy nhà trọ");
        }

        if (house.Owner == null || string.IsNullOrWhiteSpace(house.Owner.PhoneNumber))
        {
            throw new DomainException("Chủ trọ chưa có số điện thoại liên hệ");
        }

        // Tạo ContactLog
        var log = ContactLog.Create(_currentUser.UserId, request.HouseId, request.ContactType);
        _db.ContactLogs.Add(log);
        await _db.SaveChangesAsync(ct);

        return new ContactLogResponseDto(house.Owner.PhoneNumber);
    }
}

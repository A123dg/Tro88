using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common.Constants;
using Tro88.Application.Common.Interfaces;
using Tro88.Application.Common.Models;
using Tro88.Application.Features.Users.Commands.ChangePassword;
using Tro88.Application.Features.Users.Commands.UpdateProfile;
using Tro88.Application.Features.Users.Commands.UploadAvatar;
using Tro88.Application.Features.Users.DTOs;
using Tro88.Application.Features.Users.Queries.GetCurrentUser;
using Tro88.Domain.Entities;
using Tro88.Domain.Enums;
using Tro88.Domain.Exceptions;

namespace Tro88.API.Controllers;

[Authorize]
public class UsersController : BaseApiController
{
    private readonly IApplicationDbContext _db;
    private readonly IPasswordHasher _hasher;
    private readonly ICurrentUserService _currentUser;

    public UsersController(
        IApplicationDbContext db,
        IPasswordHasher hasher,
        ICurrentUserService currentUser)
    {
        _db = db;
        _hasher = hasher;
        _currentUser = currentUser;
    }

    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<IActionResult> GetUsers([FromQuery] GetUsersRequest request)
    {
        var page = request.Page <= 0 ? 1 : request.Page;
        var pageSize = request.PageSize <= 0 ? 10 : request.PageSize;
        var query = _db.Users
            .AsNoTracking()
            .Where(user => !user.IsDeleted);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var keyword = request.Search.Trim().ToLowerInvariant();
            query = query.Where(user =>
                user.FullName.ToLower().Contains(keyword) ||
                user.Email.ToLower().Contains(keyword) ||
                user.PhoneNumber.Contains(keyword));
        }

        if (!string.IsNullOrWhiteSpace(request.Role) &&
            Enum.TryParse<UserRole>(request.Role, true, out var role))
        {
            query = query.Where(user => user.Role == role);
        }

        var total = await query.CountAsync();
        var users = await query
            .OrderByDescending(user => user.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(user => UserDto.FromEntity(user))
            .ToListAsync();

        return Ok(ApiResponse<List<UserDto>>.Ok(
            users,
            metaData: new MetaData
            {
                Page = page,
                PageSize = pageSize,
                Total = total,
                TotalPage = PagedResult<UserDto>.CalculateTotalPage(total, pageSize)
            }));
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
    {
        var exists = await _db.Users.AnyAsync(
            user => !user.IsDeleted && user.Email == request.Email.ToLowerInvariant());
        if (exists)
            throw new BusinessRuleException(ErrorMessages.EMAIL_ALREADY_REGISTERED);

        var role = Enum.Parse<UserRole>(request.Role, true);
      var user = Tro88.Domain.Entities.User.CreateUserService(
    request.FullName,
    request.Email,
    request.PhoneNumber ?? string.Empty,
    _hasher.Hash(request.Password),
    role);

        user.UpdateByAdmin(
            request.FullName,
            request.Email,
            request.PhoneNumber ?? string.Empty,
            role,
            request.NationalId,
            request.DateOfBirth,
            request.IsActive);

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return Ok(ApiResponse<UserDto>.Ok(UserDto.FromEntity(user)));
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserRequest request)
    {
        var user = await _db.Users.FirstOrDefaultAsync(user => user.Id == id && !user.IsDeleted);
        if (user is null)
            return NotFound(ApiResponse<object>.Fail("USER_NOT_FOUND"));

        var email = request.Email.ToLowerInvariant();
        var emailExists = await _db.Users.AnyAsync(other =>
            !other.IsDeleted && other.Id != id && other.Email == email);
        if (emailExists)
            throw new BusinessRuleException(ErrorMessages.EMAIL_ALREADY_REGISTERED);

        var role = Enum.Parse<UserRole>(request.Role, true);
        user.UpdateByAdmin(
            request.FullName,
            request.Email,
            request.PhoneNumber ?? string.Empty,
            role,
            request.NationalId,
            request.DateOfBirth,
            request.IsActive);

        if (!string.IsNullOrWhiteSpace(request.Password))
            user.UpdatePasswordHash(_hasher.Hash(request.Password));

        await _db.SaveChangesAsync();

        return Ok(ApiResponse<UserDto>.Ok(UserDto.FromEntity(user)));
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        if (id == _currentUser.UserId)
            return BadRequest(ApiResponse<object>.Fail("CANNOT_DELETE_CURRENT_USER"));

        var user = await _db.Users.FirstOrDefaultAsync(user => user.Id == id && !user.IsDeleted);
        if (user is null)
            return NotFound(ApiResponse<object>.Fail("USER_NOT_FOUND"));

        user.Delete(_currentUser.UserId);
        await _db.SaveChangesAsync();

        return Ok(ApiResponse<object>.Ok(null));
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        var result = await Mediator.Send(new GetCurrentUserQuery());
        return Ok(ApiResponse<UserDto>.Ok(result));
    }

    [HttpPut("me")]
    public async Task<IActionResult> UpdateProfile(
        [FromBody] UpdateProfileCommand command)
    {
        var result = await Mediator.Send(command);
        return Ok(ApiResponse<UserDto>.Ok(
            result, SuccessMessages.UPDATE_PROFILE_SUCCESS));
    }

    [HttpPost("me/avatar")]
    public async Task<IActionResult> UploadAvatar(IFormFile file)
    {
        using var stream = file.OpenReadStream();
        var url = await Mediator.Send(
            new UploadAvatarCommand(stream, file.FileName));
        return Ok(ApiResponse<string>.Ok(
            url, SuccessMessages.UPLOAD_AVATAR_SUCCESS));
    }

    [HttpPatch("me/password")]
    public async Task<IActionResult> ChangePassword(
        [FromBody] ChangePasswordCommand command)
    {
        await Mediator.Send(command);
        return Ok(ApiResponse<object>.Ok(
            null, SuccessMessages.CHANGE_PASSWORD_SUCCESS));
    }

    [HttpGet("check-email")]
    public async Task<IActionResult> CheckEmail([FromQuery] string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return BadRequest(ApiResponse<object>.Fail("Email không được trống"));

        var targetEmail = email.Trim().ToLowerInvariant();
        var user = await _db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email.Trim().ToLower() == targetEmail && !u.IsDeleted);

        if (user is null)
            return Ok(ApiResponse<UserDto>.Fail("Không tìm thấy người dùng này trong hệ thống"));

        return Ok(ApiResponse<UserDto>.Ok(UserDto.FromEntity(user)));
    }
}

public sealed class GetUsersRequest
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? Search { get; set; }
    public string? Role { get; set; }
}

public sealed class CreateUserRequest
{
    public string FullName { get; set; } = default!;
    public string Email { get; set; } = default!;
    public string? PhoneNumber { get; set; }
    public string Password { get; set; } = default!;
    public string Role { get; set; } = "Tenant";
    public string? NationalId { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public bool IsActive { get; set; } = true;
}

public sealed class UpdateUserRequest
{
    public string FullName { get; set; } = default!;
    public string Email { get; set; } = default!;
    public string? PhoneNumber { get; set; }
    public string? Password { get; set; }
    public string Role { get; set; } = "Tenant";
    public string? NationalId { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public bool IsActive { get; set; } = true;
}

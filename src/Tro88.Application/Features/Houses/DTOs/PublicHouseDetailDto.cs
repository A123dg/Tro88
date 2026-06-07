using System;
using System.Collections.Generic;

namespace Tro88.Application.Features.Houses.DTOs;

public class PublicHouseOwnerDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = null!;
    public string PhoneNumber { get; set; } = null!;
    public string? AvatarUrl { get; set; }
}

public class PublicHouseDetailDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string Address { get; set; } = null!;
    public string? Description { get; set; }
    public List<string> MediaUrls { get; set; } = new();
    public decimal PriceFrom { get; set; }
    public PublicHouseOwnerDto Owner { get; set; } = null!;
}

using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tro88.Domain.Entities;

namespace Tro88.Infrastructure.Persistence.Configurations;

public class MaintenanceRequestConfiguration
    : IEntityTypeConfiguration<MaintenanceRequest>
{
    public void Configure(EntityTypeBuilder<MaintenanceRequest> b)
    {
        b.ToTable("MaintenanceRequests");
        b.HasKey(m => m.Id);
        b.Property(m => m.Id)
            .HasDefaultValueSql("NEWSEQUENTIALID()");
        b.Property(m => m.Title).IsRequired()
            .HasMaxLength(200)
            .HasColumnType("nvarchar(200)");
        b.Property(m => m.Description)
            .HasMaxLength(2000)
            .HasColumnType("nvarchar(2000)");
        b.Property(m => m.Category)
            .HasMaxLength(30)
            .HasColumnType("varchar(30)");
        b.Property(m => m.Priority)
            .HasMaxLength(20)
            .HasColumnType("varchar(20)");
        b.Property(m => m.Status)
            .HasConversion<string>()
            .HasMaxLength(20)
            .HasColumnType("varchar(20)");
        b.Property(m => m.ResolutionNote)
            .HasMaxLength(2000)
            .HasColumnType("nvarchar(2000)");
        b.Property(m => m.ResolvedAt)
            .HasColumnType("datetime2");
        b.Property(m => m.CreatedAt)
            .HasColumnType("datetime2");
        b.Property(m => m.ImageUrls)
            .HasConversion(
                v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                v => JsonSerializer.Deserialize<List<string>>(v,
                    (JsonSerializerOptions?)null) ?? new List<string>())
            .HasColumnType("nvarchar(max)");
        b.HasOne(m => m.Room)
            .WithMany()
            .HasForeignKey(m => m.RoomId)
            .OnDelete(DeleteBehavior.Restrict);
        b.HasOne(m => m.RequestedBy)
            .WithMany()
            .HasForeignKey(m => m.RequestedByUserId)
            .OnDelete(DeleteBehavior.Restrict);
        b.HasOne(m => m.AssignedTo)
            .WithMany()
            .HasForeignKey(m => m.AssignedToUserId)
            .OnDelete(DeleteBehavior.Restrict);
        b.HasIndex(m => m.Status);
        b.HasIndex(m => m.RoomId);
    }
}

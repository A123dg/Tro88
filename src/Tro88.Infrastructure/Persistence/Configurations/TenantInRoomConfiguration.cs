using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tro88.Domain.Entities;

namespace Tro88.Infrastructure.Persistence.Configurations;

public class TenantInRoomConfiguration : IEntityTypeConfiguration<TenantInRoom>
{
    public void Configure(EntityTypeBuilder<TenantInRoom> b)
    {
        b.ToTable("TenantInRooms");
        b.HasKey(t => t.Id);
        b.Property(t => t.Id)
            .HasDefaultValueSql("NEWSEQUENTIALID()");
        b.Property(t => t.Status)
            .HasMaxLength(20)
            .HasColumnType("varchar(20)");
        b.Property(t => t.CheckIn)
            .HasColumnType("datetime2");
        b.Property(t => t.CheckOut)
            .HasColumnType("datetime2");
        b.Property(t => t.CreatedAt)
            .HasColumnType("datetime2");
        b.HasOne(t => t.Contract)
            .WithMany(c => c.TenantInRooms)
            .HasForeignKey(t => t.ContractId)
            .OnDelete(DeleteBehavior.Restrict);
        b.HasOne(t => t.User)
            .WithMany(u => u.TenantInRooms)
            .HasForeignKey(t => t.UserId)
            .OnDelete(DeleteBehavior.Restrict);
        b.HasIndex(t => new { t.ContractId, t.UserId });
        b.HasIndex(t => t.Status);
    }
}

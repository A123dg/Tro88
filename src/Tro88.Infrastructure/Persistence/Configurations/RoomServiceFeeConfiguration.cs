using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tro88.Domain.Entities;

namespace Tro88.Infrastructure.Persistence.Configurations;

public class RoomServiceFeeConfiguration : IEntityTypeConfiguration<RoomServiceFee>
{
    public void Configure(EntityTypeBuilder<RoomServiceFee> b)
    {
        b.ToTable("RoomServiceFees");
        b.HasKey(r => r.Id);
        b.Property(r => r.Id)
            .HasDefaultValueSql("NEWSEQUENTIALID()");
        b.Property(r => r.Amount)
            .HasColumnType("decimal(18,0)");
        b.Property(r => r.CreatedAt)
            .HasColumnType("datetime2");

        b.HasOne(r => r.Room)
            .WithMany(ro => ro.RoomServiceFees)
            .HasForeignKey(r => r.RoomId)
            .OnDelete(DeleteBehavior.Cascade);

        b.HasOne(r => r.Service)
            .WithMany()
            .HasForeignKey(r => r.ServiceId)
            .OnDelete(DeleteBehavior.Restrict);

        b.HasIndex(r => new { r.RoomId, r.ServiceId }).IsUnique();
    }
}

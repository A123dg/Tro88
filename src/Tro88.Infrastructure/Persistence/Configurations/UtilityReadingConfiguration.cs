using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tro88.Domain.Entities;

namespace Tro88.Infrastructure.Persistence.Configurations;

public class UtilityReadingConfiguration
    : IEntityTypeConfiguration<UtilityReading>
{
    public void Configure(EntityTypeBuilder<UtilityReading> b)
    {
        b.ToTable("UtilityReadings");
        b.HasKey(u => u.Id);
        b.Property(u => u.Id)
            .HasDefaultValueSql("NEWSEQUENTIALID()");
        b.Property(u => u.ElectricityOld)
            .HasColumnType("decimal(10,2)");
        b.Property(u => u.ElectricityNew)
            .HasColumnType("decimal(10,2)");
        b.Property(u => u.ElectricityUsage)
            .HasColumnType("decimal(10,2)");
        b.Property(u => u.WaterOld)
            .HasColumnType("decimal(10,2)");
        b.Property(u => u.WaterNew)
            .HasColumnType("decimal(10,2)");
        b.Property(u => u.WaterUsage)
            .HasColumnType("decimal(10,2)");
        b.Property(u => u.Notes)
            .HasMaxLength(500)
            .HasColumnType("nvarchar(500)");
        b.Property(u => u.CreatedAt)
            .HasColumnType("datetime2");
        b.HasOne(u => u.Room)
            .WithMany(r => r.UtilityReadings)
            .HasForeignKey(u => u.RoomId)
            .OnDelete(DeleteBehavior.Restrict);
        b.HasIndex(u => new { u.RoomId, u.Year, u.Month }).IsUnique();
    }
}

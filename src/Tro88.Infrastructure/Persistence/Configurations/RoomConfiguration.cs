using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tro88.Domain.Entities;

namespace Tro88.Infrastructure.Persistence.Configurations;

public class RoomConfiguration : IEntityTypeConfiguration<Room>
{
    public void Configure(EntityTypeBuilder<Room> b)
    {
        b.ToTable("Rooms");
        b.HasKey(r => r.Id);
        b.Property(r => r.Id)
            .HasDefaultValueSql("NEWSEQUENTIALID()");
        b.Property(r => r.RoomNumber).IsRequired()
            .HasMaxLength(50).HasColumnType("varchar(50)");
        b.Property(r => r.Area)
            .HasPrecision(10, 2);
        b.Property(r => r.MonthlyRent)
            .HasPrecision(18, 2);
        b.Property(r => r.DepositAmount)
            .HasPrecision(18, 2);
        b.Property(r => r.Status)
            .HasConversion<string>().HasMaxLength(20)
            .HasColumnType("varchar(20)");
        b.Property(r => r.ElectricityUnitPrice)
            .HasPrecision(18, 2);
        b.Property(r => r.WaterUnitPrice)
            .HasPrecision(18, 2);
        b.Property(r => r.Description)
            .HasMaxLength(1000).HasColumnType("nvarchar(1000)");
        b.Property(r => r.CreatedAt)
            .HasColumnType("datetime2");
        b.Property(r => r.UpdatedAt)
            .HasColumnType("datetime2");
        b.Property(r => r.DeletedAt)
            .HasColumnType("datetime2");

        b.HasIndex(r => new { r.HouseId, r.RoomNumber }).IsUnique();

        b.HasMany(r => r.Images)
            .WithOne(i => i.Room)
            .HasForeignKey(i => i.RoomId)
            .OnDelete(DeleteBehavior.Cascade);

        b.HasMany(r => r.Contracts)
            .WithOne(c => c.Room)
            .HasForeignKey(c => c.RoomId)
            .OnDelete(DeleteBehavior.Restrict);

        b.HasMany(r => r.UtilityReadings)
            .WithOne(u => u.Room)
            .HasForeignKey(u => u.RoomId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
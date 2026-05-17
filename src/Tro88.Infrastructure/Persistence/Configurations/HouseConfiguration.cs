using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tro88.Domain.Entities;

namespace Tro88.Infrastructure.Persistence.Configurations;

public class HouseConfiguration : IEntityTypeConfiguration<House>
{
    public void Configure(EntityTypeBuilder<House> b)
    {
        b.ToTable("Houses");
        b.HasKey(h => h.Id);
        b.Property(h => h.Id)
            .HasDefaultValueSql("NEWSEQUENTIALID()");
        b.Property(h => h.Name).IsRequired()
            .HasMaxLength(200).HasColumnType("nvarchar(200)");
        b.Property(h => h.Address).IsRequired()
            .HasMaxLength(500).HasColumnType("nvarchar(500)");
        b.Property(h => h.Province)
            .HasMaxLength(100).HasColumnType("nvarchar(100)");
        b.Property(h => h.District)
            .HasMaxLength(100).HasColumnType("nvarchar(100)");
        b.Property(h => h.Description)
            .HasMaxLength(1000).HasColumnType("nvarchar(1000)");
        b.Property(h => h.CreatedAt)
            .HasColumnType("datetime2");
        b.Property(h => h.UpdatedAt)
            .HasColumnType("datetime2");
        b.Property(h => h.DeletedAt)
            .HasColumnType("datetime2");

        b.HasMany(h => h.Rooms)
            .WithOne(r => r.House)
            .HasForeignKey(r => r.HouseId)
            .OnDelete(DeleteBehavior.Restrict);

        b.HasMany(h => h.ServiceFees)
            .WithOne(s => s.House)
            .HasForeignKey(s => s.HouseId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tro88.Domain.Entities;

namespace Tro88.Infrastructure.Persistence.Configurations;

public class FavoriteHouseConfiguration : IEntityTypeConfiguration<FavoriteHouse>
{
    public void Configure(EntityTypeBuilder<FavoriteHouse> b)
    {
        b.ToTable("FavoriteHouses");
        b.HasKey(fh => fh.Id);
        
        b.Property(fh => fh.Id)
            .HasDefaultValueSql("NEWSEQUENTIALID()");

        b.Property(fh => fh.UserId)
            .IsRequired();

        b.Property(fh => fh.HouseId)
            .IsRequired();

        b.Property(fh => fh.CreatedAt)
            .HasColumnType("datetime2");

        // Unique Constraint for (UserId, HouseId)
        b.HasIndex(fh => new { fh.UserId, fh.HouseId })
            .IsUnique();

        b.HasOne(fh => fh.User)
            .WithMany()
            .HasForeignKey(fh => fh.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        b.HasOne(fh => fh.House)
            .WithMany()
            .HasForeignKey(fh => fh.HouseId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}


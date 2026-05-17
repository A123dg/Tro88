using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tro88.Domain.Entities;

namespace Tro88.Infrastructure.Persistence.Configurations;

public class RoomImageConfiguration : IEntityTypeConfiguration<RoomImage>
{
    public void Configure(EntityTypeBuilder<RoomImage> b)
    {
        b.ToTable("RoomImages");
        b.HasKey(i => i.Id);
        b.Property(i => i.Id)
            .HasDefaultValueSql("NEWSEQUENTIALID()");
        b.Property(i => i.Url).IsRequired()
            .HasMaxLength(500).HasColumnType("varchar(500)");
        b.Property(i => i.PublicId)
            .HasMaxLength(500).HasColumnType("varchar(500)");
        b.Property(i => i.CreatedAt)
            .HasColumnType("datetime2");

        b.HasIndex(i => i.RoomId);
    }
}
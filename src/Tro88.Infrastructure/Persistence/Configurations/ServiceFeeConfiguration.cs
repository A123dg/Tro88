using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tro88.Domain.Entities;

namespace Tro88.Infrastructure.Persistence.Configurations;

public class ServiceFeeConfiguration : IEntityTypeConfiguration<ServiceFee>
{
    public void Configure(EntityTypeBuilder<ServiceFee> b)
    {
        b.ToTable("ServiceFees");
        b.HasKey(s => s.Id);
        b.Property(s => s.Id)
            .HasDefaultValueSql("NEWSEQUENTIALID()");
        b.Property(s => s.Name).IsRequired()
            .HasMaxLength(100)
            .HasColumnType("nvarchar(100)");
        b.Property(s => s.FeeType)
            .HasMaxLength(20)
            .HasColumnType("varchar(20)");
        b.Property(s => s.Amount)
            .HasColumnType("decimal(18,0)");
        b.Property(s => s.Unit)
            .HasMaxLength(20)
            .HasColumnType("nvarchar(20)");
        b.Property(s => s.CreatedAt)
            .HasColumnType("datetime2");
        b.HasOne(s => s.House)
            .WithMany(h => h.ServiceFees)
            .HasForeignKey(s => s.HouseId)
            .OnDelete(DeleteBehavior.Restrict);
        b.HasIndex(s => s.HouseId);
    }
}

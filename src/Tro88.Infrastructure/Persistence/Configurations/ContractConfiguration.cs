using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tro88.Domain.Entities;

namespace Tro88.Infrastructure.Persistence.Configurations;

public class ContractConfiguration : IEntityTypeConfiguration<Contract>
{
    public void Configure(EntityTypeBuilder<Contract> b)
    {
        b.ToTable("Contracts");
        b.HasKey(c => c.Id);
        b.Property(c => c.Id)
            .HasDefaultValueSql("NEWSEQUENTIALID()");
        b.Property(c => c.ContractCode).IsRequired()
            .HasMaxLength(50).HasColumnType("varchar(50)");
        b.Property(c => c.MonthlyRent)
            .HasPrecision(18, 2);
        b.Property(c => c.DepositAmount)
            .HasPrecision(18, 2);
        b.Property(c => c.Status)
            .HasConversion<string>().HasMaxLength(20)
            .HasColumnType("varchar(20)");
        b.Property(c => c.Terms)
            .HasMaxLength(2000).HasColumnType("nvarchar(2000)");
        b.Property(c => c.SignedAt)
            .HasColumnType("datetime2");
        b.Property(c => c.CreatedAt)
            .HasColumnType("datetime2");
        b.Property(c => c.UpdatedAt)
            .HasColumnType("datetime2");
        b.Property(c => c.DeletedAt)
            .HasColumnType("datetime2");

        b.HasIndex(c => c.ContractCode).IsUnique();
        b.HasIndex(c => c.RoomId);
        b.HasIndex(c => c.TenantId);

        b.HasMany(c => c.Invoices)
            .WithOne(i => i.Contract)
            .HasForeignKey(i => i.ContractId)
            .OnDelete(DeleteBehavior.Restrict);

        b.HasMany(c => c.TenantInRooms)
            .WithOne(t => t.Contract)
            .HasForeignKey(t => t.ContractId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

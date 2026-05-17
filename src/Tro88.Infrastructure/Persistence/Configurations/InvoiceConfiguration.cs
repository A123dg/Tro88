using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tro88.Domain.Entities;

namespace Tro88.Infrastructure.Persistence.Configurations;

public class InvoiceConfiguration : IEntityTypeConfiguration<Invoice>
{
    public void Configure(EntityTypeBuilder<Invoice> b)
    {
        b.ToTable("Invoices");
        b.HasKey(i => i.Id);
        b.Property(i => i.Id)
            .HasDefaultValueSql("NEWSEQUENTIALID()");
        b.Property(i => i.InvoiceCode).IsRequired()
            .HasMaxLength(50).HasColumnType("varchar(50)");
        b.Property(i => i.RentAmount)
            .HasPrecision(18, 2);
        b.Property(i => i.ElectricityAmount)
            .HasPrecision(18, 2);
        b.Property(i => i.WaterAmount)
            .HasPrecision(18, 2);
        b.Property(i => i.ServiceAmount)
            .HasPrecision(18, 2);
        b.Property(i => i.TotalAmount)
            .HasPrecision(18, 2);
        b.Property(i => i.Status)
            .HasConversion<string>().HasMaxLength(20)
            .HasColumnType("varchar(20)");
        b.Property(i => i.Notes)
            .HasMaxLength(500).HasColumnType("nvarchar(500)");
        b.Property(i => i.PaidAt)
            .HasColumnType("datetime2");
        b.Property(i => i.CreatedAt)
            .HasColumnType("datetime2");
        b.Property(i => i.UpdatedAt)
            .HasColumnType("datetime2");

        b.HasIndex(i => i.InvoiceCode).IsUnique();
        b.HasIndex(i => i.ContractId);
        b.HasIndex(i => i.RoomId);

        b.HasMany(i => i.LineItems)
            .WithOne(l => l.Invoice)
            .HasForeignKey(l => l.InvoiceId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tro88.Domain.Entities;

namespace Tro88.Infrastructure.Persistence.Configurations;

public class InvoiceLineItemConfiguration : IEntityTypeConfiguration<InvoiceLineItem>
{
    public void Configure(EntityTypeBuilder<InvoiceLineItem> b)
    {
        b.ToTable("InvoiceLineItems");
        b.HasKey(l => l.Id);
        b.Property(l => l.Id)
            .HasDefaultValueSql("NEWSEQUENTIALID()");
        b.Property(l => l.Description).IsRequired()
            .HasMaxLength(200).HasColumnType("nvarchar(200)");
        b.Property(l => l.UnitPrice)
            .HasPrecision(18, 2);
        b.Property(l => l.Quantity)
            .HasPrecision(18, 4);
        b.Property(l => l.Amount)
            .HasPrecision(18, 2);

        b.HasIndex(l => l.InvoiceId);
    }
}
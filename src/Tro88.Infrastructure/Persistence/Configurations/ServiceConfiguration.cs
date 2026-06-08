using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using Tro88.Domain.Entities;

namespace Tro88.Infrastructure.Persistence.Configurations;

public class ServiceConfiguration : IEntityTypeConfiguration<Service>
{
    public void Configure(EntityTypeBuilder<Service> b)
    {
        b.ToTable("Services");
        b.HasKey(s => s.Id);
        b.Property(s => s.Id)
            .HasDefaultValueSql("NEWSEQUENTIALID()");
        b.Property(s => s.Name).IsRequired()
            .HasMaxLength(100)
            .HasColumnType("nvarchar(100)");
        b.Property(s => s.FeeType)
            .HasMaxLength(20)
            .HasColumnType("varchar(20)");
        b.Property(s => s.Unit)
            .HasMaxLength(20)
            .HasColumnType("nvarchar(20)");
        b.Property(s => s.CreatedAt)
            .HasColumnType("datetime2");

        b.HasData(
            Service.CreateSeeded(Guid.Parse("11111111-1111-1111-1111-111111111111"), "Điện", "Usage", "kWh"),
            Service.CreateSeeded(Guid.Parse("22222222-2222-2222-2222-222222222222"), "Nước", "Usage", "m³"),
            Service.CreateSeeded(Guid.Parse("33333333-3333-3333-3333-333333333333"), "Wifi", "Fixed", "Tháng"),
            Service.CreateSeeded(Guid.Parse("44444444-4444-4444-4444-444444444444"), "Gửi xe", "Fixed", "Xe"),
            Service.CreateSeeded(Guid.Parse("55555555-5555-5555-5555-555555555555"), "Rác", "Fixed", "Tháng")
        );
    }
}

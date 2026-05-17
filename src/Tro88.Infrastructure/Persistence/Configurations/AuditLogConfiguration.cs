using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tro88.Domain.Entities;

namespace Tro88.Infrastructure.Persistence.Configurations;

public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> b)
    {
        b.ToTable("AuditLogs");
        b.HasKey(a => a.Id);
        b.Property(a => a.Action)
            .HasMaxLength(20)
            .HasColumnType("varchar(20)");
        b.Property(a => a.Module)
            .HasMaxLength(50)
            .HasColumnType("varchar(50)");
        b.Property(a => a.OldValues)
            .HasColumnType("nvarchar(max)");
        b.Property(a => a.NewValues)
            .HasColumnType("nvarchar(max)");
        b.Property(a => a.IpAddress)
            .HasMaxLength(50)
            .HasColumnType("varchar(50)");
        b.Property(a => a.CreatedAt)
            .HasColumnType("datetime2");
        b.HasIndex(a => a.Module);
        b.HasIndex(a => a.UserId);
        b.HasIndex(a => a.CreatedAt);
    }
}

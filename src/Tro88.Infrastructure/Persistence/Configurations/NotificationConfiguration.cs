using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tro88.Domain.Entities;

namespace Tro88.Infrastructure.Persistence.Configurations;

public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> b)
    {
        b.ToTable("Notifications");
        b.HasKey(n => n.Id);
        b.Property(n => n.Id)
            .HasDefaultValueSql("NEWSEQUENTIALID()");
        b.Property(n => n.Title).IsRequired()
            .HasMaxLength(200)
            .HasColumnType("nvarchar(200)");
        b.Property(n => n.Body)
            .HasMaxLength(1000)
            .HasColumnType("nvarchar(1000)");
        b.Property(n => n.Type)
            .HasMaxLength(30)
            .HasColumnType("varchar(30)");
        b.Property(n => n.Status)
            .HasConversion<string>()
            .HasMaxLength(20)
            .HasColumnType("varchar(20)");
        b.Property(n => n.ReadAt)
            .HasColumnType("datetime2");
        b.Property(n => n.CreatedAt)
            .HasColumnType("datetime2");
        b.HasOne(n => n.User)
            .WithMany()
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Restrict);
        b.HasIndex(n => new { n.UserId, n.Status });
        b.HasIndex(n => n.CreatedAt);
    }
}

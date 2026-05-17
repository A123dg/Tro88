using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tro88.Domain.Entities;

namespace Tro88.Infrastructure.Persistence.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> b)
    {
        b.ToTable("Users");
        b.HasKey(u => u.Id);
        b.Property(u => u.Id)
            .HasDefaultValueSql("NEWSEQUENTIALID()");
        b.Property(u => u.FullName).IsRequired()
            .HasMaxLength(100).HasColumnType("nvarchar(100)");
        b.Property(u => u.Email).IsRequired()
            .HasMaxLength(256).HasColumnType("nvarchar(256)");
        b.Property(u => u.PhoneNumber)
            .HasMaxLength(20).HasColumnType("varchar(20)");
        b.Property(u => u.PasswordHash)
            .HasMaxLength(500).HasColumnType("varchar(500)");
        b.Property(u => u.Role)
            .HasConversion<string>().HasMaxLength(20)
            .HasColumnType("varchar(20)");
        b.Property(u => u.GoogleId)
            .HasMaxLength(100).HasColumnType("varchar(100)");
        b.Property(u => u.NationalId)
            .HasMaxLength(50).HasColumnType("varchar(50)");
        b.Property(u => u.AvatarUrl)
            .HasMaxLength(500).HasColumnType("varchar(500)");
        b.Property(u => u.RefreshToken)
            .HasMaxLength(500).HasColumnType("varchar(500)");
        b.Property(u => u.CreatedAt)
            .HasColumnType("datetime2");
        b.Property(u => u.UpdatedAt)
            .HasColumnType("datetime2");
        b.Property(u => u.DeletedAt)
            .HasColumnType("datetime2");
        b.Property(u => u.DateOfBirth)
            .HasColumnType("date");

        b.HasIndex(u => u.Email).IsUnique();
        b.HasIndex(u => u.GoogleId);
        b.HasIndex(u => u.PhoneNumber);

        b.HasMany(u => u.Houses)
            .WithOne(h => h.Owner)
            .HasForeignKey(h => h.OwnerId)
            .OnDelete(DeleteBehavior.Restrict);

        b.HasMany(u => u.Contracts)
            .WithOne(c => c.Tenant)
            .HasForeignKey(c => c.TenantId)
            .OnDelete(DeleteBehavior.Restrict);

        b.HasMany(u => u.TenantInRooms)
            .WithOne(t => t.User)
            .HasForeignKey(t => t.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
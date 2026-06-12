using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tro88.Domain.Entities;

namespace Tro88.Infrastructure.Persistence.Configurations;

public class ContactLogConfiguration : IEntityTypeConfiguration<ContactLog>
{
    public void Configure(EntityTypeBuilder<ContactLog> b)
    {
        b.ToTable("ContactLogs");
        b.HasKey(cl => cl.Id);

        b.Property(cl => cl.Id)
            .HasDefaultValueSql("NEWSEQUENTIALID()");

        b.Property(cl => cl.UserId)
            .IsRequired();

        b.Property(cl => cl.HouseId)
            .IsRequired();

        b.Property(cl => cl.ContactType)
            .IsRequired()
            .HasMaxLength(50)
            .HasColumnType("varchar(50)");

        b.Property(cl => cl.CreatedAt)
            .HasColumnType("datetime2");

        b.HasOne(cl => cl.User)
            .WithMany()
            .HasForeignKey(cl => cl.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        b.HasOne(cl => cl.House)
            .WithMany()
            .HasForeignKey(cl => cl.HouseId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}


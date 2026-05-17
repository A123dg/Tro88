using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tro88.Domain.Entities;

namespace Tro88.Infrastructure.Persistence.Configurations;

public class AiConversationConfiguration
    : IEntityTypeConfiguration<AiConversation>
{
    public void Configure(EntityTypeBuilder<AiConversation> b)
    {
        b.ToTable("AiConversations");
        b.HasKey(c => c.Id);
        b.Property(c => c.Id)
            .HasDefaultValueSql("NEWSEQUENTIALID()");
        b.Property(c => c.Title).IsRequired()
            .HasMaxLength(200)
            .HasColumnType("nvarchar(200)");
        b.Property(c => c.CreatedAt)
            .HasColumnType("datetime2");
        b.HasOne(c => c.User)
            .WithMany()
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Restrict);
        b.HasIndex(c => c.UserId);
    }
}

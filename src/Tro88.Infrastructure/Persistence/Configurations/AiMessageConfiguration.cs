using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tro88.Domain.Entities;

namespace Tro88.Infrastructure.Persistence.Configurations;

public class AiMessageConfiguration : IEntityTypeConfiguration<AiMessage>
{
    public void Configure(EntityTypeBuilder<AiMessage> b)
    {
        b.ToTable("AiMessages");
        b.HasKey(m => m.Id);
        b.Property(m => m.Role)
            .HasMaxLength(20)
            .HasColumnType("varchar(20)");
        b.Property(m => m.Content)
            .IsRequired()
            .HasColumnType("nvarchar(max)");
        b.Property(m => m.CreatedAt)
            .HasColumnType("datetime2");
        b.HasOne(m => m.Conversation)
            .WithMany(c => c.Messages)
            .HasForeignKey(m => m.ConversationId)
            .OnDelete(DeleteBehavior.Cascade);
        b.HasIndex(m => m.ConversationId);
    }
}

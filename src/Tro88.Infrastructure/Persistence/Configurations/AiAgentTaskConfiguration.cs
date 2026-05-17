using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tro88.Domain.Entities;

namespace Tro88.Infrastructure.Persistence.Configurations;

public class AiAgentTaskConfiguration : IEntityTypeConfiguration<AiAgentTask>
{
    public void Configure(EntityTypeBuilder<AiAgentTask> b)
    {
        b.ToTable("AiAgentTasks");
        b.HasKey(t => t.Id);
        b.Property(t => t.Id)
            .HasDefaultValueSql("NEWSEQUENTIALID()");
        b.Property(t => t.TaskType)
            .HasMaxLength(50)
            .HasColumnType("varchar(50)");
        b.Property(t => t.Input)
            .HasColumnType("nvarchar(max)");
        b.Property(t => t.Output)
            .HasColumnType("nvarchar(max)");
        b.Property(t => t.Status)
            .HasConversion<string>()
            .HasMaxLength(20)
            .HasColumnType("varchar(20)");
        b.Property(t => t.ErrorMessage)
            .HasMaxLength(1000)
            .HasColumnType("nvarchar(1000)");
        b.Property(t => t.CreatedAt)
            .HasColumnType("datetime2");
        b.Property(t => t.CompletedAt)
            .HasColumnType("datetime2");
        b.HasOne(t => t.Conversation)
            .WithMany(c => c.Tasks)
            .HasForeignKey(t => t.ConversationId)
            .OnDelete(DeleteBehavior.Restrict);
        b.HasIndex(t => t.Status);
    }
}

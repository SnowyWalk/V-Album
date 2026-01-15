using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Domain.Entities;

namespace Server.Data.Configurations
{
    public class PostTagConfiguration : IEntityTypeConfiguration<PostTag>
    {
        public void Configure(EntityTypeBuilder<PostTag> b)
        {
            b.ToTable("PostTag");

            b.HasKey(x => new { x.PostUuid, x.TargetUserUuid });

            b.Property(x => x.CreatedAt).IsRequired();

            b.HasOne(x => x.Post)
                .WithMany(x => x.Tags)
                .HasForeignKey(x => x.PostUuid)
                .OnDelete(DeleteBehavior.Cascade); // Post를 실제로 hard delete 할 때만 의미 있음

            b.HasOne(x => x.TargetUser)
                .WithMany(x => x.PostTagsTargetingMe)
                .HasForeignKey(x => x.TargetUserUuid)
                .OnDelete(DeleteBehavior.Restrict);

            // [Index] (postUUID, createdAt)
            b.HasIndex(x => new { x.PostUuid, x.CreatedAt })
                .HasDatabaseName("IX_PostTag_PostUuid_CreatedAt");
        }
    }
}
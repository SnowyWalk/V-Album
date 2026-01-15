using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Domain.Entities;

namespace Server.Data.Configurations
{
    public class PostCommentConfiguration : IEntityTypeConfiguration<PostComment>
    {
        public void Configure(EntityTypeBuilder<PostComment> b)
        {
            b.ToTable("PostComment");

            b.HasKey(x => x.Uuid);

            b.Property(x => x.PostUuid).IsRequired();
            b.Property(x => x.UserUuid).IsRequired();
            b.Property(x => x.Body).IsRequired();

            b.Property(x => x.CreatedAt).IsRequired();
            b.Property(x => x.UpdatedAt).IsRequired();
            b.Property(x => x.DeletedAt);

            b.HasOne(x => x.Post)
                .WithMany(x => x.Comments)
                .HasForeignKey(x => x.PostUuid)
                .OnDelete(DeleteBehavior.Restrict);

            b.HasOne(x => x.User)
                .WithMany(x => x.Comments)
                .HasForeignKey(x => x.UserUuid)
                .OnDelete(DeleteBehavior.Restrict);

            // [Index] (postUUID, createdAt DESC, deletedAt IS NULL)
            b.HasIndex(x => new { x.PostUuid, x.CreatedAt })
                .HasDatabaseName("IX_PostComment_PostUuid_CreatedAt_DESC_Active")
                .IsDescending(false, true)
                .HasFilter("deletedAt IS NULL");
        }
    }
}
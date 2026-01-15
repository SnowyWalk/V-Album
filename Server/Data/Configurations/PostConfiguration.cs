using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Domain.Entities;

namespace Server.Data.Configurations
{
    public class PostConfiguration : IEntityTypeConfiguration<Post>
    {
        public void Configure(EntityTypeBuilder<Post> b)
        {
            b.ToTable("Post");

            b.HasKey(x => x.Uuid);

            b.Property(x => x.GroupUuid).IsRequired();
            b.Property(x => x.UserUuid).IsRequired();

            b.Property(x => x.Title).IsRequired().HasMaxLength(200);
            b.Property(x => x.Body).IsRequired();

            b.Property(x => x.CreatedAt).IsRequired();
            b.Property(x => x.UpdatedAt).IsRequired();
            b.Property(x => x.DeletedAt);

            b.HasOne(x => x.Group)
                .WithMany(x => x.Posts)
                .HasForeignKey(x => x.GroupUuid)
                .OnDelete(DeleteBehavior.Restrict);

            b.HasOne(x => x.User)
                .WithMany(x => x.Posts)
                .HasForeignKey(x => x.UserUuid)
                .OnDelete(DeleteBehavior.Restrict);

            // [Index] (groupUUID, createdAt DESC)
            b.HasIndex(x => new { x.GroupUuid, x.CreatedAt })
                .HasDatabaseName("IX_Post_GroupUuid_CreatedAt_DESC")
                .IsDescending(false, true);

            // [Index] (groupUUID, userUUID, createdAt DESC, deletedAt IS NULL)
            b.HasIndex(x => new { x.GroupUuid, x.UserUuid, x.CreatedAt })
                .HasDatabaseName("IX_Post_GroupUser_CreatedAt_DESC_Active")
                .IsDescending(false, false, true)
                .HasFilter("deletedAt IS NULL");
        }
    }
}
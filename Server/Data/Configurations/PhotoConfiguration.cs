using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Domain.Entities;

namespace Server.Data.Configurations
{
    public class PhotoConfiguration : IEntityTypeConfiguration<Photo>
    {
        public void Configure(EntityTypeBuilder<Photo> b)
        {
            b.ToTable("Photo");

            b.HasKey(x => x.Uuid);

            b.Property(x => x.GroupUuid).IsRequired();
            b.Property(x => x.PostUuid).IsRequired();
            b.Property(x => x.SortOrder).IsRequired();

            b.Property(x => x.PlaceUuid);

            b.Property(x => x.Src).IsRequired();
            b.Property(x => x.PreviewSrc).IsRequired();

            b.Property(x => x.Width).IsRequired();
            b.Property(x => x.Height).IsRequired();

            b.Property(x => x.Size).IsRequired();
            b.Property(x => x.SrcHash).IsRequired().HasMaxLength(128);

            b.Property(x => x.CreatedAt).IsRequired();
            b.Property(x => x.UpdatedAt).IsRequired();

            b.HasOne(x => x.Group)
                .WithMany(x => x.Photos)
                .HasForeignKey(x => x.GroupUuid)
                .OnDelete(DeleteBehavior.Restrict);

            b.HasOne(x => x.Post)
                .WithMany(x => x.Photos)
                .HasForeignKey(x => x.PostUuid)
                .OnDelete(DeleteBehavior.Cascade); // Post hard delete 시 사진 같이 삭제되게

            b.HasOne(x => x.Place)
                .WithMany(x => x.Photos)
                .HasForeignKey(x => x.PlaceUuid)
                .OnDelete(DeleteBehavior.SetNull);

            // [Index] (postUUID, sortOrder)
            b.HasIndex(x => new { x.PostUuid, x.SortOrder })
                .HasDatabaseName("IX_Photo_PostUuid_SortOrder");

            // [Index] (hash)  -> srcHash
            b.HasIndex(x => x.SrcHash)
                .HasDatabaseName("IX_Photo_SrcHash");

            // [Index] (groupUUID, createdAt DESC, sortOrder DESC)
            b.HasIndex(x => new { x.GroupUuid, x.CreatedAt, x.SortOrder })
                .HasDatabaseName("IX_Photo_GroupUuid_CreatedAt_DESC_SortOrder_DESC")
                .IsDescending(false, true, true);

            // [Unique Key] (groupUUID, hash) -> (groupUUID, srcHash)
            b.HasIndex(x => new { x.GroupUuid, x.SrcHash })
                .IsUnique()
                .HasDatabaseName("UX_Photo_GroupUuid_SrcHash");
        }
    }
}
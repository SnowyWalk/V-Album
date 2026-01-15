using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Domain.Entities;

namespace Server.Data.Configurations
{
    public class MemberConfiguration : IEntityTypeConfiguration<Member>
    {
        public void Configure(EntityTypeBuilder<Member> b)
        {
            b.ToTable("Member");

            b.HasKey(x => new { x.GroupUuid, x.UserUuid });

            b.Property(x => x.Role).IsRequired();
            b.Property(x => x.Alias).IsRequired().HasMaxLength(64);

            b.Property(x => x.JoinedAt).IsRequired();
            b.Property(x => x.UpdatedAt).IsRequired();
            b.Property(x => x.DeletedAt);

            b.HasOne(x => x.User)
                .WithMany(x => x.Memberships)
                .HasForeignKey(x => x.UserUuid)
                .OnDelete(DeleteBehavior.Restrict);

            b.HasOne(x => x.Group)
                .WithMany(x => x.Members)
                .HasForeignKey(x => x.GroupUuid)
                .OnDelete(DeleteBehavior.Restrict);

            // [Index] (userUUID, deletedAt IS NULL)
            b.HasIndex(x => x.UserUuid)
                .HasDatabaseName("IX_Member_UserUuid_Active")
                .HasFilter("deletedAt IS NULL");

            // [Index] (groupUUID, joinedAt, deletedAt IS NULL)
            b.HasIndex(x => new { x.GroupUuid, x.JoinedAt })
                .HasDatabaseName("IX_Member_GroupUuid_JoinedAt_Active")
                .HasFilter("deletedAt IS NULL");
        }
    }
}
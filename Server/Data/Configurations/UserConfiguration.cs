using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Domain.Entities;

namespace Server.Data.Configurations
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> b)
        {
            b.ToTable("User");

            b.HasKey(x => x.Uuid);

            b.Property(x => x.DisplayName).IsRequired().HasMaxLength(64);
            b.Property(x => x.UserType).IsRequired();
            b.Property(x => x.ExternalId);

            b.Property(x => x.CreatedAt).IsRequired();
            b.Property(x => x.UpdatedAt).IsRequired();
            b.Property(x => x.RegisteredAt);
            b.Property(x => x.DeletedAt);

            // displayName 중복 허용 => 유니크 안 잡음
        }
    }
}
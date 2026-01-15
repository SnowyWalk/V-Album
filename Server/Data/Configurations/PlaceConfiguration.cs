using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Domain.Entities;

namespace Server.Data.Configurations
{
    public class PlaceConfiguration : IEntityTypeConfiguration<Place>
    {
        public void Configure(EntityTypeBuilder<Place> b)
        {
            b.ToTable("Place");

            b.HasKey(x => x.Uuid);

            b.Property(x => x.Name).IsRequired().HasMaxLength(200);

            b.Property(x => x.ValidatedAt).IsRequired();
            b.Property(x => x.ValidatedVersion).IsRequired();

            b.Property(x => x.CreatedAt).IsRequired();
            b.Property(x => x.UpdatedAt).IsRequired();
            b.Property(x => x.DeletedAt);
        }
    }
}
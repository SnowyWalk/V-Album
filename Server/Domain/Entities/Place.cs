namespace Server.Domain.Entities
{
    public class Place : EntityBase, ISoftDeletable
    {
        public string Name { get; set; } = null!;

        public DateTimeOffset ValidatedAt { get; set; }
        public long ValidatedVersion { get; set; }

        public DateTimeOffset? DeletedAt { get; set; }

        public ICollection<Photo> Photos { get; set; } = new List<Photo>();
    }
}
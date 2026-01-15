namespace Server.Domain.Entities
{
    public class Post : EntityBase, ISoftDeletable
    {
        public Guid GroupUuid { get; set; }
        public Guid UserUuid { get; set; }

        public string Title { get; set; } = null!;
        public string Body { get; set; } = null!;

        public DateTimeOffset? DeletedAt { get; set; }

        public Group Group { get; set; } = null!;
        public User User { get; set; } = null!;

        public ICollection<PostTag> Tags { get; set; } = new List<PostTag>();
        public ICollection<PostComment> Comments { get; set; } = new List<PostComment>();
        public ICollection<Photo> Photos { get; set; } = new List<Photo>();
    }
}
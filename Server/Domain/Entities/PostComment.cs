namespace Server.Domain.Entities
{
    public class PostComment : EntityBase, ISoftDeletable
    {
        public Guid PostUuid { get; set; }
        public Guid UserUuid { get; set; }

        public string Body { get; set; } = null!;
        public DateTimeOffset? DeletedAt { get; set; }

        public Post Post { get; set; } = null!;
        public User User { get; set; } = null!;
    }
}
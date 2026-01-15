namespace Server.Domain.Entities
{
    public class PostTag
    {
        public Guid PostUuid { get; set; }
        public Guid TargetUserUuid { get; set; }

        public DateTimeOffset CreatedAt { get; set; }

        public Post Post { get; set; } = null!;
        public User TargetUser { get; set; } = null!;
    }
}
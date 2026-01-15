namespace Server.Domain.Entities
{
    public class Member : ISoftDeletable
    {
        public Guid UserUuid { get; set; }
        public Guid GroupUuid { get; set; }

        public MemberRole Role { get; set; }
        public string Alias { get; set; } = null!;

        public DateTimeOffset JoinedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
        public DateTimeOffset? DeletedAt { get; set; }

        public User User { get; set; } = null!;
        public Group Group { get; set; } = null!;
    }
}
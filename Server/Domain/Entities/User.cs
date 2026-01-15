using Microsoft.Extensions.Hosting;

namespace Server.Domain.Entities
{
    public class User : EntityBase, ISoftDeletable
    {
        public string DisplayName { get; set; } = null!;
        public UserType UserType { get; set; }
        public Guid? ExternalId { get; set; }

        public DateTimeOffset? RegisteredAt { get; set; }
        public DateTimeOffset? DeletedAt { get; set; }

        public ICollection<Member> Memberships { get; set; } = new List<Member>();
        public ICollection<Post> Posts { get; set; } = new List<Post>();
        public ICollection<PostComment> Comments { get; set; } = new List<PostComment>();
        public ICollection<PostTag> PostTagsTargetingMe { get; set; } = new List<PostTag>();
    }
}
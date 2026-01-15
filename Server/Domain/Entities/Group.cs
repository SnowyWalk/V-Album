
namespace Server.Domain.Entities
{
    public class Group : EntityBase, ISoftDeletable
    {
        public string Name { get; set; } = null!;
        public DateTimeOffset? DeletedAt { get; set; }

        public ICollection<Member> Members { get; set; } = new List<Member>();
        public ICollection<Post> Posts { get; set; } = new List<Post>();
        public ICollection<Photo> Photos { get; set; } = new List<Photo>();
    }
}
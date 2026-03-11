using System;
using System.Collections.Generic;

namespace V_Album_Server.Infrastructures.Persistence.Scaffold;

public partial class User
{
    public Guid UserUuid { get; set; }

    public string? GoogleSub { get; set; }

    public string Nickname { get; set; } = null!;

    public string? Pic { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public DateTime? DeletedAt { get; set; }

    public virtual ICollection<Member> Members { get; set; } = new List<Member>();

    public virtual ICollection<Post> Posts { get; set; } = new List<Post>();
}

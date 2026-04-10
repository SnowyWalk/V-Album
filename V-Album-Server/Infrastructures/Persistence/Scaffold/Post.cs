using System;
using System.Collections.Generic;

namespace V_Album_Server.Infrastructures.Persistence.Scaffold;

public partial class Post
{
    public Guid PostUuid { get; set; }

    public Guid GroupUuid { get; set; }

    public Guid UserUuid { get; set; }

    public string? Content { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public DateTime? DeletedAt { get; set; }

    public virtual Group GroupUu { get; set; } = null!;

    public virtual ICollection<Like> Likes { get; set; } = new List<Like>();

    public virtual ICollection<Photo> Photos { get; set; } = new List<Photo>();

    public virtual User UserUu { get; set; } = null!;
}

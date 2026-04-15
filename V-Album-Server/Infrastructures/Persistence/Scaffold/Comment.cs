using System;
using System.Collections.Generic;

namespace V_Album_Server.Infrastructures.Persistence.Scaffold;

public partial class Comment
{
    public Guid CommentUuid { get; set; }

    public Guid PostUuid { get; set; }

    public Guid UserUuid { get; set; }

    public string Content { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public DateTime? DeletedAt { get; set; }

    public virtual Post PostUu { get; set; } = null!;

    public virtual User UserUu { get; set; } = null!;
}

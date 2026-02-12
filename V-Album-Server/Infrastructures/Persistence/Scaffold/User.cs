using System;
using System.Collections.Generic;

namespace V_Album_Server.Infrastructures.Persistence.Scaffold;

public partial class User
{
    public int Id { get; set; }

    public string UserUuid { get; set; } = null!;

    public string? GoogleSub { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public DateTime? DeletedAt { get; set; }
}

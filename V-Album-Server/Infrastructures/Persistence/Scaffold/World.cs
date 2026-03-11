using System;
using System.Collections.Generic;

namespace V_Album_Server.Infrastructures.Persistence.Scaffold;

public partial class World
{
    public Guid WorldUuid { get; set; }

    public string? Name { get; set; }

    public virtual ICollection<Photo> Photos { get; set; } = new List<Photo>();
}

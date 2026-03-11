using System;
using System.Collections.Generic;

namespace V_Album_Server.Infrastructures.Persistence.Scaffold;

public partial class Photo
{
    public Guid PhotoUuid { get; set; }

    public Guid PostUuid { get; set; }

    public int SortOrder { get; set; }

    public Guid? WorldUuid { get; set; }

    public int Width { get; set; }

    public int Height { get; set; }

    public long Size { get; set; }

    public byte[] Hash { get; set; } = null!;

    public string? Format { get; set; }

    public virtual Post PostUu { get; set; } = null!;

    public virtual World? WorldUu { get; set; }
}

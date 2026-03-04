namespace V_Album_Server.Infrastructures.Persistence.Scaffold;

public partial class Group
{
    public Guid GroupUuid { get; set; }

    public string Name { get; set; } = null!;

    public string? Pic { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public DateTime? DeletedAt { get; set; }
}

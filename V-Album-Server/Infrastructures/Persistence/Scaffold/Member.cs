namespace V_Album_Server.Infrastructures.Persistence.Scaffold;

public partial class Member
{
    public Guid UserUuid { get; set; }

    public Guid GroupUuid { get; set; }

    public string Role { get; set; } = null!;

    public string? Alias { get; set; }

    public DateTime JoinedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public DateTime? DeletedAt { get; set; }
}

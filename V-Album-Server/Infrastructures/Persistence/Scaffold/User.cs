namespace V_Album_Server.Infrastructures.Persistence.Scaffold;

public partial class User
{
    public int Id { get; set; }

    public Guid UserUuid { get; set; }

    public string? GoogleSub { get; set; }

    public string Nickname { get; set; } = null!;

    public string? Pic { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public DateTime? DeletedAt { get; set; }
}

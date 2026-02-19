namespace V_Album_Server.Infrastructures.Persistence.Scaffold;

public partial class User
{
    public int Id { get; set; }

    public string UserUuid { get; set; } = null!;

    public string? GoogleSub { get; set; }

    public string Nickname { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public DateTime? DeletedAt { get; set; }
}

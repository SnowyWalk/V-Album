using System;
using System.Collections.Generic;

namespace V_Album_Server.Infrastructures.Persistence.Scaffold;

public partial class Auth
{
    public int Id { get; set; }

    public string UserUuid { get; set; } = null!;

    public string? GoogleSub { get; set; }
}

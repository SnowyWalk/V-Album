using V_Album_Server.Infrastructures.Persistence.Scaffold;
namespace V_Album_Server.Infrastructures.Persistence.Repositories;

public class GroupRepository
{
    private readonly AppDbContext m_dbContext;
    
    public GroupRepository(AppDbContext dbContext) 
    {
        m_dbContext = dbContext;
    }
}
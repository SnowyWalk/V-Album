using Microsoft.EntityFrameworkCore.Storage;
using V_Album_Server.Interfaces;
namespace V_Album_Server.Infrastructures.Persistence.Scaffold;

public class EFUnitOfWork(AppDbContext dbContext) : IUnitOfWork
{
    public Task SaveChangesAsync(CancellationToken ct)
    {
        return dbContext.SaveChangesAsync(ct);
    }
    public Task<IDbContextTransaction> BeginTransactionAsync(CancellationToken ct)
    {
        return dbContext.Database.BeginTransactionAsync(ct);
    }
    public Task CommitTransactionAsync(CancellationToken ct)
    {
        return dbContext.Database.CommitTransactionAsync(ct);
    }
}
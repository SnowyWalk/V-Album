using V_Album_Server.Infrastructures.Persistence.Mapping;
using V_Album_Server.Infrastructures.Persistence.Scaffold;
namespace V_Album_Server.Infrastructures.Persistence.Repositories;

public class PhotoRepository(AppDbContext dbContext)
{
    public async Task<DomainPhoto> AddPhotoAsync(Guid postUuid, Guid photoUuid, int sortOrder, Guid? worldUuid, int width, int height, long size, byte[] hash, string format, bool save, CancellationToken ct)
    {
        PhotoEntity newPhotoEntity = new PhotoEntity { 
            PhotoUuid = photoUuid,
            PostUuid = postUuid,
            SortOrder = sortOrder,
            WorldUuid = worldUuid,
            Width = width,
            Height = height,
            Size = size,
            Hash = hash,
            Format = format,
        };
        await dbContext.Photos.AddAsync(newPhotoEntity, ct);
        
        if (save)
            await dbContext.SaveChangesAsync(ct);
        
        return newPhotoEntity.ToDomain();
    }
}
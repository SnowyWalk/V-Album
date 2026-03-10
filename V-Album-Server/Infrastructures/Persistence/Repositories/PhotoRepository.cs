using V_Album_Server.Infrastructures.Persistence.Mapping;
using V_Album_Server.Infrastructures.Persistence.Scaffold;
namespace V_Album_Server.Infrastructures.Persistence.Repositories;

public class PhotoRepository(AppDbContext dbContext)
{
    public async Task<DomainPhoto> AddPhotoAsync(Guid postUuid, int sortOrder, Guid? worldUuid, int width, int height, int size, byte[] hash, string format, CancellationToken ct)
    {
        Guid newPhotoUuid = Guid.NewGuid();
        PhotoEntity newPhotoEntity = new PhotoEntity { 
            PhotoUuid = newPhotoUuid,
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
        return newPhotoEntity.ToDomain();
    }
}
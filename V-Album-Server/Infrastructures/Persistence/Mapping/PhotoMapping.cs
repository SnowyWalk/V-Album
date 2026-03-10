namespace V_Album_Server.Infrastructures.Persistence.Mapping;

public static class PhotoMapping
{
    public static DomainPhoto ToDomain(this PhotoEntity photo)
    {
        return new DomainPhoto(photo.PhotoUuid, photo.PostUuid, photo.SortOrder, photo.WorldUuid, photo.Width, photo.Height, photo.Size, photo.Hash, photo.Format);
    }
}
namespace V_Album_Server.Domains.Photo;

public class Photo
{
    Guid PhotoUuid { get; }
    Guid PostUuid { get; }
    int SortOrder { get; }
    Guid? WorldUuid { get; }
    int Width { get; }
    int Height { get; }
    long Size { get; }
    byte[] Hash { get; }
    string? Format { get; }
    
    public Photo(Guid photoPhotoUuid, Guid photoPostUuid, int sortOrder, Guid? worldUuid, int width, int height, long size, byte[] photoHash, string? format)
    {
        PhotoUuid = photoPhotoUuid;
        PostUuid = photoPostUuid;
        SortOrder = sortOrder;
        WorldUuid = worldUuid;
        Width = width;
        Height = height;
        Size = size;
        Hash = photoHash;
        Format = format;
    }
}
using System.Text.Json;
using V_Album_Server.Infrastructures.BackgroundJobs;
using V_Album_Server.Infrastructures.Persistence.Mapping;
using V_Album_Server.Infrastructures.Persistence.Repositories;
using V_Album_Server.Interfaces;
using V_Album_Server.Services.Member;
using V_Album_Server.Services.Post;
using V_Album_Server.Services.User;

namespace V_Album_Server.UseCases.Post;

public class UpdatePostUseCase(
    UserRepository userRepository,
    PostRepository postRepository,
    PhotoRepository photoRepository,
    IUnitOfWork uow,
    MemberService memberService,
    PostPhotoService postPhotoService)
{
    private sealed record OrderedPhoto(string Kind, string Id);

    public async Task Execute(
        string googleSub,
        Guid postUuid,
        string? content,
        string? photoOrderJson,
        IReadOnlyList<string>? newPhotoClientIds,
        IReadOnlyList<IFormFile>? newPhotos,
        CancellationToken ct)
    {
        DomainUser? me = await userRepository.GetUserByGoogleSub(googleSub, ct);
        if (me is null)
            throw new UserNotFoundException(googleSub);

        PostEntity? postEntity = await postRepository.GetPostAsync(postUuid, ct);
        if (postEntity is null)
            throw new InvalidOperationException("Post not found.");

        if (!await memberService.HasAuthorityAsync(me.UserUuid, postEntity.GroupUuid, postEntity.UserUuid, ct))
            throw new UnauthorizedAccessException();

        PhotoEntity[] existingPhotoEntities = await photoRepository.GetPhotosByPostAsync(postUuid, ct);
        OrderedPhoto[] orderedPhotos = ParsePhotoOrder(photoOrderJson, existingPhotoEntities);
        Dictionary<Guid, PhotoEntity> existingPhotoMap = existingPhotoEntities.ToDictionary(e => e.PhotoUuid);
        Dictionary<string, IFormFile> newPhotoMap = BuildNewPhotoMap(newPhotoClientIds, newPhotos);
        HashSet<string> seenOrderEntries = [];

        foreach (OrderedPhoto orderedPhoto in orderedPhotos)
        {
            if (!seenOrderEntries.Add($"{orderedPhoto.Kind}:{orderedPhoto.Id}"))
                throw new InvalidOperationException("Duplicated photo order item.");

            switch (orderedPhoto.Kind)
            {
                case "existing":
                    Guid existingPhotoUuid = ParseGuid(orderedPhoto.Id, "existing photo");
                    if (!existingPhotoMap.ContainsKey(existingPhotoUuid))
                        throw new InvalidOperationException("Photo not found in post.");
                    break;
                case "new":
                    if (!newPhotoMap.ContainsKey(orderedPhoto.Id))
                        throw new InvalidOperationException("New photo is missing.");
                    break;
                default:
                    throw new InvalidOperationException("Unsupported photo kind.");
            }
        }

        if (orderedPhotos.Length == 0 && string.IsNullOrWhiteSpace(content))
            throw new InvalidOperationException("Post must have content or at least one photo.");

        postEntity.Content = string.IsNullOrWhiteSpace(content) ? null : content;
        postEntity.UpdatedAt = DateTime.UtcNow;

        HashSet<Guid> keptPhotoUuids = [];
        List<ThumbnailJob> thumbnailJobs = [];
        int sortOrder = 1;
        foreach (OrderedPhoto orderedPhoto in orderedPhotos)
        {
            if (orderedPhoto.Kind == "existing")
            {
                Guid photoUuid = ParseGuid(orderedPhoto.Id, "existing photo");
                PhotoEntity photoEntity = existingPhotoMap[photoUuid];
                photoEntity.SortOrder = sortOrder;
                keptPhotoUuids.Add(photoUuid);
            }
            else
            {
                ThumbnailJob thumbnailJob = await postPhotoService.AddPhotoAsync(postUuid, postEntity.GroupUuid, sortOrder, newPhotoMap[orderedPhoto.Id], ct);
                thumbnailJobs.Add(thumbnailJob);
            }

            sortOrder++;
        }

        DomainPhoto[] removedPhotos = existingPhotoEntities
            .Where(e => !keptPhotoUuids.Contains(e.PhotoUuid))
            .Select(e => e.ToDomain())
            .ToArray();

        photoRepository.DeletePhotos(existingPhotoEntities.Where(e => !keptPhotoUuids.Contains(e.PhotoUuid)));

        await uow.SaveChangesAsync(ct);

        foreach (ThumbnailJob thumbnailJob in thumbnailJobs)
            await postPhotoService.EnqueueThumbnailAsync(thumbnailJob, ct);

        await postPhotoService.DeletePhotoFilesAsync(postEntity.GroupUuid, postUuid, removedPhotos, ct);
    }

    private static OrderedPhoto[] ParsePhotoOrder(string? photoOrderJson, IReadOnlyList<PhotoEntity> existingPhotos)
    {
        if (string.IsNullOrWhiteSpace(photoOrderJson))
        {
            return existingPhotos
                .OrderBy(e => e.SortOrder)
                .ThenBy(e => e.PhotoUuid)
                .Select(e => new OrderedPhoto("existing", e.PhotoUuid.ToString()))
                .ToArray();
        }

        string[]? entries = JsonSerializer.Deserialize<string[]>(photoOrderJson);
        if (entries is null)
            throw new InvalidOperationException("Invalid photo order.");

        return entries.Select(ParseOrderedPhoto).ToArray();
    }

    private static OrderedPhoto ParseOrderedPhoto(string value)
    {
        int separatorIndex = value.IndexOf(':');
        if (separatorIndex <= 0 || separatorIndex == value.Length - 1)
            throw new InvalidOperationException("Invalid photo order item.");

        return new OrderedPhoto(value[..separatorIndex], value[(separatorIndex + 1)..]);
    }

    private static Dictionary<string, IFormFile> BuildNewPhotoMap(IReadOnlyList<string>? clientIds, IReadOnlyList<IFormFile>? files)
    {
        if ((clientIds?.Count ?? 0) != (files?.Count ?? 0))
            throw new InvalidOperationException("New photo metadata is invalid.");

        Dictionary<string, IFormFile> result = [];
        if (clientIds is null || files is null)
            return result;

        for (int i = 0; i < clientIds.Count; i++)
        {
            if (!result.TryAdd(clientIds[i], files[i]))
                throw new InvalidOperationException("Duplicated new photo id.");
        }

        return result;
    }

    private static Guid ParseGuid(string value, string fieldName)
    {
        if (!Guid.TryParse(value, out Guid guid))
            throw new InvalidOperationException($"{fieldName} id is invalid.");

        return guid;
    }
}

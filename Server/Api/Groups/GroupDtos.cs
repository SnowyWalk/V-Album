namespace Server.Api.Groups;

public sealed record GroupSummaryDto(Guid GroupUuid, string Name);

public sealed record TimelinePostDto(
    Guid PostUuid,
    Guid AuthorUserUuid,
    string AuthorDisplayName,
    string Title,
    string Body,
    DateTimeOffset CreatedAt,
    int PhotoCount,
    int CommentCount,
    int TagCount,
    string? FirstPreviewSrc
);

public sealed record PhotoItemDto(
    Guid PhotoUuid,
    Guid PostUuid,
    int SortOrder,
    string Src,
    string PreviewSrc,
    int Width,
    int Height,
    long Size,
    string SrcHash,
    DateTimeOffset CreatedAt,
    Guid? PlaceUuid,
    string? PlaceName
);

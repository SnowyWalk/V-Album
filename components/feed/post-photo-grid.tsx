"use client";

import {memo} from "react";

import PhotoTile from "@/components/feed/photo-tile";
import {FeedItem} from "@/lib/api/schema-alias";

function PostPhotoGrid({
    feedItem,
    onClickPhotoAction,
}: {
    feedItem: FeedItem;
    onClickPhotoAction?: (idx: number) => void;
}) {
    if (!feedItem.photos || feedItem.photos.length === 0) return null;

    const photos = [...feedItem.photos].sort(
        (a, b) => a.sortOrder - b.sortOrder || a.photoUuid.localeCompare(b.photoUuid)
    );
    const post = feedItem.post;
    const count = photos.length;

    if (count === 1) {
        return (
            <div className="aspect-4/3 w-full">
                <PhotoTile
                    post={post}
                    photos={photos}
                    onClickPhotoAction={onClickPhotoAction}
                    idx={0}
                    className="h-full w-full"
                />
            </div>
        );
    }

    if (count === 2) {
        return (
            <div className="grid grid-cols-2 gap-0.5">
                <PhotoTile post={post} photos={photos} onClickPhotoAction={onClickPhotoAction} idx={0} className="aspect-square"/>
                <PhotoTile post={post} photos={photos} onClickPhotoAction={onClickPhotoAction} idx={1} className="aspect-square"/>
            </div>
        );
    }

    if (count === 3) {
        return (
            <div className="grid grid-cols-2 gap-0.5">
                <PhotoTile post={post} photos={photos} onClickPhotoAction={onClickPhotoAction} idx={0} className="col-span-2 w-full aspect-2/1"/>
                <PhotoTile post={post} photos={photos} onClickPhotoAction={onClickPhotoAction} idx={1} className="aspect-square"/>
                <PhotoTile post={post} photos={photos} onClickPhotoAction={onClickPhotoAction} idx={2} className="aspect-square"/>
            </div>
        );
    }

    if (count === 4) {
        return (
            <div className="grid grid-cols-2 gap-0.5">
                {[0, 1, 2, 3].map((i) => (
                    <PhotoTile post={post} photos={photos} onClickPhotoAction={onClickPhotoAction} key={i} idx={i} className="aspect-square"/>
                ))}
            </div>
        );
    }

    if (count === 5) {
        return (
            <div className="flex flex-col gap-0.5">
                <div className="grid grid-cols-2 gap-0.5">
                    <PhotoTile post={post} photos={photos} onClickPhotoAction={onClickPhotoAction} idx={0} className="aspect-square"/>
                    <PhotoTile post={post} photos={photos} onClickPhotoAction={onClickPhotoAction} idx={1} className="aspect-square"/>
                </div>
                <div className="grid grid-cols-3 gap-0.5">
                    <PhotoTile post={post} photos={photos} onClickPhotoAction={onClickPhotoAction} idx={2} className="aspect-square"/>
                    <PhotoTile post={post} photos={photos} onClickPhotoAction={onClickPhotoAction} idx={3} className="aspect-square"/>
                    <PhotoTile post={post} photos={photos} onClickPhotoAction={onClickPhotoAction} idx={4} className="aspect-square"/>
                </div>
            </div>
        );
    }

    if (count === 6) {
        return (
            <div className="grid grid-cols-3 gap-0.5">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                    <PhotoTile post={post} photos={photos} onClickPhotoAction={onClickPhotoAction} key={i} idx={i} className="aspect-square"/>
                ))}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-0.5">
            <PhotoTile post={post} photos={photos} onClickPhotoAction={onClickPhotoAction} idx={0} className="w-full aspect-2/1"/>
            <div className="grid grid-cols-5 gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                    <PhotoTile post={post} photos={photos} onClickPhotoAction={onClickPhotoAction} key={i} idx={i} className="aspect-square"/>
                ))}
            </div>
        </div>
    );
}

export default memo(PostPhotoGrid);

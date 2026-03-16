"use client";

import {FeedItemDto} from "@/dto/feed-item-dto";
import {cn, GetPhotoUrl} from "@/lib/utils";
import Image from "next/image";
import {PhotoItem} from "@/components/image-viewer";

export default function PostPhotoGrid({feedItem, onClickPhoto}: {
    feedItem: FeedItemDto,
    onClickPhoto: (photos: PhotoItem[], idx: number) => void
}) {
    if (feedItem.photos == null || feedItem.photos.length == 0)
        return <></>

    const photos = feedItem.photos;
    const post = feedItem.post;
    
    const photoItems: PhotoItem[] = photos.map(photo => ({ 
        src: GetPhotoUrl(post, photo),
        photo: photo }));
    
    return (
        <div className={`grid gap-0.5 ${photos!.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {photos!.map((photo, idx) => (
                <div
                    key={photo.photoUuid}
                    className={cn(
                        "relative overflow-hidden bg-muted cursor-pointer",
                        photos!.length === 1 ? "aspect-video" : "aspect-square"
                    )}
                    onClick={() => onClickPhoto(photoItems, idx)}
                >
                    <Image
                        src={GetPhotoUrl(post, photo)}
                        alt={`post-image-${idx}`}
                        fill
                        className="object-cover transition-transform hover:scale-105"
                        unoptimized={true}
                    />
                </div>
            ))}
        </div>
    )
}

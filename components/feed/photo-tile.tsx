"use client";

import {cn, GetPhotoUrl} from "@/lib/utils";
import LazyImage from "@/components/lazy-image";
import {PhotoDto} from "@/dto/photo-dto";
import {PostDto} from "@/dto/post-dto";
import {PhotoItem} from "@/components/image-viewer";

export default function Tile({post, photos, idx, onClickPhotoAction, className}: {
    post: PostDto;
    photos: PhotoDto[] | null;
    idx: number;
    onClickPhotoAction?: (photos: PhotoItem[], idx: number) => void;
    className?: string
}) {
    if (!photos || photos.length === 0) return null;

    const photoItems: PhotoItem[] = photos.map(photo => ({
        src: GetPhotoUrl(post, photo),
        photo,
    }));

    const photo = photos[idx];
    const count = photos.length;
    const isOverlay = count > 7 && idx === 5;
    const remaining = count - 6;

    const handleClick = (idx: number) =>
        onClickPhotoAction?.(photoItems, idx);

    return (
        <div
            key={photo.photoUuid}
            onClick={() => handleClick(idx)}
            className={cn(
                "relative overflow-hidden bg-muted cursor-pointer group",
                className
            )}
        >
            <LazyImage
                src={GetPhotoUrl(post, photo)}
                alt={`post-image-${idx}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                unoptimized
            />
            {isOverlay && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white text-xl font-semibold">
                            +{remaining}
                        </span>
                </div>
            )}
        </div>
    );
};

"use client";

import type {MouseEvent} from "react";

import {cn, GetPhotoUrl} from "@/lib/utils";
import LazyImage from "@/components/lazy-image";
import {Photo, Post} from "@/lib/api/schema-alias";

export default function PhotoTile({post, photos, idx, onClickPhotoAction, className}: {
    post: Post;
    photos: Photo[] | null;
    idx: number;
    onClickPhotoAction?: (idx: number) => void;
    className?: string
}) {
    if (!photos || photos.length === 0) return null;

    const photo = photos[idx];
    const count = photos.length;
    const isOverlay = count > 7 && idx === 5;
    const remaining = count - 6;

    const handleClick = (event: MouseEvent<HTMLDivElement>, index: number) => {
        event.stopPropagation();
        onClickPhotoAction?.(index);
    };

    return (
        <div
            key={photo.photoUuid}
            onClick={(event) => handleClick(event, idx)}
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

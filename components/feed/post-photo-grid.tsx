"use client";

import { FeedItemDto } from "@/dto/feed-item-dto";
import { cn, GetPhotoUrl } from "@/lib/utils";
import { PhotoItem } from "@/components/image-viewer";
import LazyImage from "@/components/lazy-image";
import Tile from "@/components/feed/photo-tile";

export default function PostPhotoGrid({
                                          feedItem,
                                          onClickPhotoAction,
                                      }: {
    feedItem: FeedItemDto;
    onClickPhotoAction?: (photos: PhotoItem[], idx: number) => void;
}) {
    if (!feedItem.photos || feedItem.photos.length === 0) return null;

    const photos = feedItem.photos;
    const post = feedItem.post;
    const count = photos.length;
    
    // ── 1장: 와이드 ──────────────────────────────────────
    if (count === 1) {
        return (
            <div className="w-full aspect-[4/3]">
                <Tile post={post} photos={photos} onClickPhotoAction={onClickPhotoAction} post={post} photos={photos} onClickPhotoAction={onClickPhotoAction} idx={0} className="w-full h-full" />
            </div>
        );
    }

    // ── 2장: 나란히 ──────────────────────────────────────
    if (count === 2) {
        return (
            <div className="grid grid-cols-2 gap-0.5">
                <Tile post={post} photos={photos} onClickPhotoAction={onClickPhotoAction} idx={0} className="aspect-square" />
                <Tile post={post} photos={photos} onClickPhotoAction={onClickPhotoAction} idx={1} className="aspect-square" />
            </div>
        );
    }

    // ── 3장: 왼쪽 큰 사진 + 오른쪽 2장 세로 ─────────────
    if (count === 3) {
        return (
            <div className="grid grid-cols-2 gap-0.5">
                <Tile post={post} photos={photos} onClickPhotoAction={onClickPhotoAction} idx={0} className="row-span-2 aspect-auto h-full min-h-48" />
                <Tile post={post} photos={photos} onClickPhotoAction={onClickPhotoAction} idx={1} className="aspect-square" />
                <Tile post={post} photos={photos} onClickPhotoAction={onClickPhotoAction} idx={2} className="aspect-square" />
            </div>
        );
    }

    // ── 4장: 2×2 격자 ────────────────────────────────────
    if (count === 4) {
        return (
            <div className="grid grid-cols-2 gap-0.5">
                {[0, 1, 2, 3].map(i => (
                    <Tile post={post} photos={photos} onClickPhotoAction={onClickPhotoAction} key={i} idx={i} className="aspect-square" />
                ))}
            </div>
        );
    }

    // ── 5장: 상단 큰 2장 + 하단 작은 3장 ────────────────
    if (count === 5) {
        return (
            <div className="flex flex-col gap-0.5">
                <div className="grid grid-cols-2 gap-0.5">
                    <Tile post={post} photos={photos} onClickPhotoAction={onClickPhotoAction} idx={0} className="aspect-square" />
                    <Tile post={post} photos={photos} onClickPhotoAction={onClickPhotoAction} idx={1} className="aspect-square" />
                </div>
                <div className="grid grid-cols-3 gap-0.5">
                    <Tile post={post} photos={photos} onClickPhotoAction={onClickPhotoAction} idx={2} className="aspect-square" />
                    <Tile post={post} photos={photos} onClickPhotoAction={onClickPhotoAction} idx={3} className="aspect-square" />
                    <Tile post={post} photos={photos} onClickPhotoAction={onClickPhotoAction} idx={4} className="aspect-square" />
                </div>
            </div>
        );
    }

    // ── 6장: 2×3 격자 ────────────────────────────────────
    if (count === 6) {
        return (
            <div className="grid grid-cols-3 gap-0.5">
                {[0, 1, 2, 3, 4, 5].map(i => (
                    <Tile post={post} photos={photos} onClickPhotoAction={onClickPhotoAction} key={i} idx={i} className="aspect-square" />
                ))}
            </div>
        );
    }

    // ── 7장+: 상단 큰 1장 + 나머지 5장 (마지막에 +N 오버레이) ──
    return (
        <div className="flex flex-col gap-0.5">
            <Tile post={post} photos={photos} onClickPhotoAction={onClickPhotoAction} idx={0} className="w-full aspect-[2/1]" />
            <div className="grid grid-cols-5 gap-0.5">
                {[1, 2, 3, 4, 5].map(i => (
                    <Tile post={post} photos={photos} onClickPhotoAction={onClickPhotoAction} key={i} idx={i} className="aspect-square" />
                ))}
            </div>
        </div>
    );
}
"use client";

import Image from "next/image";
import type {KeyboardEvent, MouseEvent, ReactNode} from "react";
import {useEffect, useRef, useState} from "react";
import {ArrowLeft, ArrowRight, Upload} from "lucide-react";

import {Button} from "@/components/ui/button";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    type CarouselApi,
} from "@/components/ui/carousel";
import {cn} from "@/lib/utils";

export type PhotoPreviewItem = {
    id: string;
    src: string;
    alt?: string;
};

type PhotoPreviewViewerProps = {
    items: PhotoPreviewItem[];
    selectedIndex: number;
    onSelectedIndexChange: (index: number) => void;
    className?: string;
    viewportClassName?: string;
    imageClassName?: string;
    sizes?: string;
    priorityIndex?: number;
    emptyContent?: ReactNode;
    showThumbnails?: boolean;
    thumbnailStripClassName?: string;
    thumbnailClassName?: string;
    onEmptyClick?: () => void;
    onDragOver?: React.DragEventHandler<HTMLDivElement>;
    onDrop?: React.DragEventHandler<HTMLDivElement>;
};

const defaultEmptyContent = (
    <>
        <div className="rounded-full border border-border/70 bg-secondary p-4 shadow-sm">
            <Upload className="h-8 w-8 text-muted-foreground"/>
        </div>
        <div className="space-y-1">
            <p className="text-base font-medium">사진을 끌어오거나 파일을 선택하세요</p>
            <p className="text-sm text-muted-foreground">여기에서 보이는 순서가 게시글 사진 순서가 됩니다.</p>
        </div>
    </>
);

export function PhotoPreviewViewer({
    items,
    selectedIndex,
    onSelectedIndexChange,
    className,
    viewportClassName,
    imageClassName,
    sizes = "min(760px, 100vw)",
    priorityIndex = selectedIndex,
    emptyContent = defaultEmptyContent,
    showThumbnails = false,
    thumbnailStripClassName,
    thumbnailClassName,
    onEmptyClick,
    onDragOver,
    onDrop,
}: PhotoPreviewViewerProps) {
    const [api, setApi] = useState<CarouselApi>();
    const thumbnailStripRef = useRef<HTMLDivElement | null>(null);
    const thumbnailDragRef = useRef({
        isDragging: false,
        startX: 0,
        scrollLeft: 0,
        hasMoved: false,
    });
    const [isThumbnailDragging, setIsThumbnailDragging] = useState(false);
    const hasPhotos = items.length > 0;
    const boundedIndex = hasPhotos ? Math.min(Math.max(selectedIndex, 0), items.length - 1) : -1;

    useEffect(() => {
        if (!api) {
            return;
        }

        const syncSelectedPhoto = () => {
            const nextIndex = api.selectedScrollSnap();
            if (items[nextIndex] && nextIndex !== selectedIndex) {
                onSelectedIndexChange(nextIndex);
            }
        };

        api.on("select", syncSelectedPhoto);
        api.on("reInit", syncSelectedPhoto);

        return () => {
            api.off("select", syncSelectedPhoto);
            api.off("reInit", syncSelectedPhoto);
        };
    }, [api, items, onSelectedIndexChange, selectedIndex]);

    useEffect(() => {
        if (!api || boundedIndex < 0) {
            return;
        }

        if (api.selectedScrollSnap() !== boundedIndex) {
            api.scrollTo(boundedIndex);
        }
    }, [api, boundedIndex]);

    const moveFocus = (direction: -1 | 1) => {
        if (boundedIndex < 0) {
            return;
        }

        const nextIndex = boundedIndex + direction;
        if (nextIndex < 0 || nextIndex >= items.length) {
            return;
        }

        onSelectedIndexChange(nextIndex);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
        if (event.key === "ArrowLeft") {
            event.preventDefault();
            moveFocus(-1);
        }

        if (event.key === "ArrowRight") {
            event.preventDefault();
            moveFocus(1);
        }
    };

    const handleThumbnailMouseDown = (event: MouseEvent<HTMLDivElement>) => {
        const target = thumbnailStripRef.current;
        if (!target) {
            return;
        }

        thumbnailDragRef.current = {
            isDragging: true,
            startX: event.clientX,
            scrollLeft: target.scrollLeft,
            hasMoved: false,
        };
        setIsThumbnailDragging(true);
    };

    const handleThumbnailMouseMove = (event: MouseEvent<HTMLDivElement>) => {
        const target = thumbnailStripRef.current;
        const drag = thumbnailDragRef.current;
        if (!target || !drag.isDragging) {
            return;
        }

        const delta = event.clientX - drag.startX;
        if (Math.abs(delta) > 4) {
            drag.hasMoved = true;
        }

        target.scrollLeft = drag.scrollLeft - delta;
    };

    const stopThumbnailDrag = () => {
        thumbnailDragRef.current.isDragging = false;
        setIsThumbnailDragging(false);
    };

    const handleThumbnailClick = (index: number) => {
        if (thumbnailDragRef.current.hasMoved) {
            thumbnailDragRef.current.hasMoved = false;
            return;
        }

        onSelectedIndexChange(index);
    };

    return (
        <div
            className={cn(
                "mx-auto grid w-full max-w-[760px] grid-cols-[48px_minmax(0,1fr)_48px] items-center gap-3 sm:grid-cols-[56px_minmax(0,1fr)_56px]",
                className
            )}
            onKeyDownCapture={handleKeyDown}
        >
            <div className="flex justify-center">
                {items.length > 1 && (
                    <Button
                        type="button"
                        size="icon"
                        variant="secondary"
                        className="h-11 w-11 rounded-full border border-border/70 bg-card/90 shadow-sm transition-colors hover:bg-secondary"
                        onClick={() => moveFocus(-1)}
                        disabled={boundedIndex <= 0}
                    >
                        <ArrowLeft className="h-5 w-5"/>
                    </Button>
                )}
            </div>

            <div
                onDragOver={onDragOver}
                onDrop={onDrop}
                tabIndex={0}
                className={cn(
                    "relative flex aspect-video w-full flex-none items-center justify-center overflow-hidden rounded-2xl border select-none shadow-sm",
                    hasPhotos
                        ? "border-border/70 bg-card"
                        : "border-dashed border-border/70 bg-gradient-to-br from-card via-secondary/35 to-muted/45",
                    viewportClassName
                )}
            >
                {hasPhotos ? (
                    <>
                        <Carousel
                            setApi={setApi}
                            className="h-full w-full"
                            opts={{
                                loop: false,
                                align: "start",
                            }}
                        >
                            <CarouselContent className="-ml-0 h-full">
                                {items.map((item, index) => (
                                    <CarouselItem key={item.id} className="pl-0">
                                        <div className="relative h-full w-full">
                                            <Image
                                                src={item.src}
                                                alt={item.alt ?? `photo-${index + 1}`}
                                                fill
                                                className={cn("object-contain p-4", imageClassName)}
                                                sizes={sizes}
                                                unoptimized
                                                draggable={false}
                                                priority={index === priorityIndex}
                                            />
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                        </Carousel>
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent p-4">
                            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/90 px-3 py-1 text-xs font-medium tracking-[0.2em] text-foreground shadow-sm backdrop-blur-sm">
                                <span className="tabular-nums">{boundedIndex + 1}</span>
                                <span className="text-muted-foreground">/</span>
                                <span className="tabular-nums text-muted-foreground">{items.length}</span>
                            </div>
                        </div>
                    </>
                ) : onEmptyClick ? (
                    <button
                        type="button"
                        onClick={onEmptyClick}
                        className="flex h-full w-full flex-col items-center justify-center gap-4 px-8 py-12 text-center"
                    >
                        {emptyContent}
                    </button>
                ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-8 py-12 text-center">
                        {emptyContent}
                    </div>
                )}
            </div>

            <div className="flex justify-center">
                {items.length > 1 && (
                    <Button
                        type="button"
                        size="icon"
                        variant="secondary"
                        className="h-11 w-11 rounded-full border border-border/70 bg-card/90 shadow-sm transition-colors hover:bg-secondary"
                        onClick={() => moveFocus(1)}
                        disabled={boundedIndex >= items.length - 1}
                    >
                        <ArrowRight className="h-5 w-5"/>
                    </Button>
                )}
            </div>

            {showThumbnails && items.length > 1 && (
                <div
                    ref={thumbnailStripRef}
                    onMouseDown={handleThumbnailMouseDown}
                    onMouseMove={handleThumbnailMouseMove}
                    onMouseUp={stopThumbnailDrag}
                    onMouseLeave={stopThumbnailDrag}
                    className={cn(
                        "col-span-3 min-w-0 overflow-x-auto overflow-y-hidden px-3 pb-1 pt-2 select-none",
                        isThumbnailDragging ? "cursor-grabbing" : "cursor-grab",
                        thumbnailStripClassName
                    )}
                >
                    <div className="flex w-max min-w-full items-center justify-center gap-2">
                        {items.map((item, index) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => handleThumbnailClick(index)}
                                draggable={false}
                                className={cn(
                                    "relative h-16 w-28 shrink-0 overflow-hidden rounded-sm border border-border/70 bg-secondary/45 ring-offset-background transition focus:outline-none",
                                    boundedIndex === index
                                        ? "z-10 scale-105 opacity-100 ring-2 ring-primary ring-offset-2"
                                        : "opacity-60 hover:opacity-100",
                                    thumbnailClassName
                                )}
                            >
                                <Image
                                    src={item.src}
                                    alt=""
                                    fill
                                    className="pointer-events-none object-contain"
                                    sizes="112px"
                                    unoptimized
                                    draggable={false}
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

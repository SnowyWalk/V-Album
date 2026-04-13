"use client";

import * as React from "react";
import {Calendar, Check, ChevronLeft, ChevronRight, Copy, Info, MapPin, Users, X} from "lucide-react";

import {Button} from "@/components/ui/button";
import {Carousel, CarouselContent, CarouselItem, type CarouselApi} from "@/components/ui/carousel";
import {Dialog, DialogContent, DialogDescription, DialogTitle} from "@/components/ui/dialog";
import LazyImage from "@/components/lazy-image";
import {cn} from "@/lib/utils";

export interface PhotoMetadata {
    locationName?: string;
    latitude?: number;
    longitude?: number;
    date?: string;
    taggedPeople?: string[];
}

export interface PhotoItem {
    src: string;
    metadata?: PhotoMetadata;
}

interface ImageViewerProps {
    photoItems: PhotoItem[];
    initialIndex?: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ImageViewer({
    photoItems,
    initialIndex = 0,
    open,
    onOpenChange,
}: ImageViewerProps) {
    const [api, setApi] = React.useState<CarouselApi>();
    const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
    const [showMetadata, setShowMetadata] = React.useState(false);
    const [mounted, setMounted] = React.useState(false);
    const [isCentered, setIsCentered] = React.useState(true);
    const [copiedText, setCopiedText] = React.useState<string | null>(null);
    const scrollRef = React.useRef<HTMLDivElement>(null);

    const [isDragging, setIsDragging] = React.useState(false);
    const [startX, setStartX] = React.useState(0);
    const [scrollLeft, setScrollLeft] = React.useState(0);
    const [hasMoved, setHasMoved] = React.useState(false);

    const currentPhoto = photoItems[currentIndex];

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedText(text);
            setTimeout(() => setCopiedText(null), 2000);
        } catch (err) {
            console.error("Failed to copy text: ", err);
        }
    };

    const renderCopyButton = (text: string) => (
        <Button
            variant="ghost"
            size="icon"
            className="ml-1 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={() => copyToClipboard(text)}
        >
            {copiedText === text ? (
                <Check className="h-3 w-3 text-green-500"/>
            ) : (
                <Copy className="h-3 w-3"/>
            )}
        </Button>
    );

    React.useEffect(() => {
        setMounted(true);
    }, []);

    React.useEffect(() => {
        if (!open || !mounted) {
            return;
        }

        const isAlreadyHidden = window.getComputedStyle(document.body).overflow === "hidden";
        if (isAlreadyHidden) {
            return;
        }

        const originalOverflow = document.body.style.overflow;
        const originalPaddingRight = document.body.style.paddingRight;
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

        document.body.style.overflow = "hidden";
        if (scrollbarWidth > 0) {
            document.body.style.paddingRight = `${scrollbarWidth}px`;
        }

        return () => {
            document.body.style.overflow = originalOverflow;
            document.body.style.paddingRight = originalPaddingRight;
        };
    }, [mounted, open]);

    React.useEffect(() => {
        const checkCentered = () => {
            if (!scrollRef.current) {
                return;
            }

            const container = scrollRef.current;
            const innerContainer = container.firstElementChild as HTMLElement | null;

            if (!innerContainer) {
                return;
            }

            setIsCentered(innerContainer.scrollWidth <= container.offsetWidth + 1);
        };

        if (!mounted || !open) {
            return;
        }

        checkCentered();

        const observer = new ResizeObserver(() => {
            checkCentered();
        });

        if (scrollRef.current) {
            observer.observe(scrollRef.current);
        }

        const timer = setTimeout(checkCentered, 50);

        return () => {
            clearTimeout(timer);
            observer.disconnect();
        };
    }, [mounted, open, photoItems.length]);

    React.useEffect(() => {
        if (open) {
            setCurrentIndex(initialIndex);
        }
    }, [initialIndex, open]);

    React.useEffect(() => {
        if (!api) return;

        const onSelect = () => {
            setCurrentIndex(api.selectedScrollSnap());
        };

        api.on("select", onSelect);
        onSelect();

        return () => {
            api.off("select", onSelect);
        };
    }, [api]);

    React.useEffect(() => {
        if (!open || !api) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "ArrowLeft") {
                api.scrollPrev();
            } else if (event.key === "ArrowRight") {
                api.scrollNext();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [api, open]);

    React.useEffect(() => {
        if (api && open) {
            api.scrollTo(initialIndex, true);
            setCurrentIndex(initialIndex);
        }
    }, [api, initialIndex, open]);

    React.useEffect(() => {
        if (!open || !mounted) {
            return;
        }

        const scrollThumbnailToCenter = () => {
            const container = scrollRef.current;
            if (!container) return;

            const flexContainer = container.firstElementChild as HTMLElement | null;
            if (!flexContainer) return;

            const isScrollable = flexContainer.scrollWidth > container.offsetWidth + 1;
            if (!isScrollable) {
                container.scrollTo({left: 0, behavior: "instant"});
                return;
            }

            const targetThumbnail = container.querySelector(`button[data-index="${initialIndex}"]`) as HTMLElement | null;
            if (!targetThumbnail) return;

            const containerWidth = container.offsetWidth;
            const thumbnailWidth = targetThumbnail.offsetWidth;
            const thumbnailLeft = targetThumbnail.offsetLeft;
            const targetScrollLeft = thumbnailLeft - (containerWidth / 2) + (thumbnailWidth / 2);

            container.scrollTo({
                left: Math.max(0, targetScrollLeft),
                behavior: "instant",
            });
        };

        scrollThumbnailToCenter();

        const timer = setTimeout(scrollThumbnailToCenter, 50);
        return () => clearTimeout(timer);
    }, [initialIndex, mounted, open]);

    const goToPhoto = (index: number) => {
        api?.scrollTo(index);
    };

    const handleMouseDown = (event: React.MouseEvent) => {
        if (!scrollRef.current) return;
        setIsDragging(true);
        setHasMoved(false);
        setStartX(event.pageX - scrollRef.current.offsetLeft);
        setScrollLeft(scrollRef.current.scrollLeft);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (event: React.MouseEvent) => {
        if (!isDragging || !scrollRef.current) return;

        event.preventDefault();
        const x = event.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX) * 2;

        if (Math.abs(walk) > 5) {
            setHasMoved(true);
        }

        scrollRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleThumbnailClick = (index: number) => {
        if (hasMoved) return;
        goToPhoto(index);
    };

    if (!mounted) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
            <DialogContent
                showCloseButton={false}
                onPointerDownOutside={(event) => event.preventDefault()}
                onInteractOutside={(event) => event.preventDefault()}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => event.stopPropagation()}
                className="fixed inset-0 left-0 top-0 z-60 flex h-screen w-screen max-w-none translate-x-0 translate-y-0 flex-col border-none bg-background/40 p-0 text-foreground outline-none ring-0 backdrop-blur-md duration-200 sm:max-w-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0"
            >
                <DialogTitle className="sr-only">사진 뷰어</DialogTitle>
                <DialogDescription className="sr-only">
                    {currentIndex + 1} / {photoItems.length}번째 사진
                </DialogDescription>

                <div className="absolute right-4 top-4 z-50 flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-full text-foreground hover:bg-accent"
                        onClick={() => setShowMetadata(!showMetadata)}
                    >
                        <Info className="h-6 w-6"/>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-full text-foreground hover:bg-accent"
                        onClick={() => onOpenChange(false)}
                    >
                        <X className="h-6 w-6"/>
                    </Button>
                </div>

                <div className="relative flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden bg-transparent select-none">
                    <Carousel
                        setApi={setApi}
                        className="h-full w-full"
                        opts={{
                            startIndex: initialIndex,
                            loop: true,
                        }}
                    >
                        <CarouselContent className="ml-0">
                            {photoItems.map((photoItem, index) => (
                                <CarouselItem key={index} className="relative pl-0">
                                    <div className="absolute inset-0 flex items-center justify-center p-8 md:p-12 lg:p-16">
                                        <div className="relative h-full w-full">
                                            <LazyImage
                                                src={photoItem.src}
                                                alt=""
                                                fill
                                                className="object-contain"
                                                priority={index === initialIndex}
                                                sizes="100vw"
                                                draggable={false}
                                                unoptimized
                                            />
                                        </div>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>

                        <div className="hidden md:block">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute left-4 top-1/2 h-12 w-12 -translate-y-1/2 rounded-full text-foreground hover:bg-accent"
                                onClick={() => api?.scrollPrev()}
                                disabled={!api?.canScrollPrev()}
                            >
                                <ChevronLeft className="h-8 w-8"/>
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-4 top-1/2 h-12 w-12 -translate-y-1/2 rounded-full text-foreground hover:bg-accent"
                                onClick={() => api?.scrollNext()}
                                disabled={!api?.canScrollNext()}
                            >
                                <ChevronRight className="h-8 w-8"/>
                            </Button>
                        </div>
                    </Carousel>

                    {showMetadata && (
                        <div className="group/metadata absolute bottom-24 left-1/2 z-50 mx-4 w-full max-w-md -translate-x-1/2 rounded-lg border border-border bg-background/60 p-4 backdrop-blur-md">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-2 h-6 w-6 rounded-full opacity-0 transition-opacity group-hover/metadata:opacity-100"
                                onClick={() => setShowMetadata(false)}
                            >
                                <X className="h-3 w-3"/>
                            </Button>
                            <div className="space-y-2 pr-4 text-sm text-foreground">
                                {currentPhoto?.metadata ? (
                                    <>
                                        {currentPhoto.metadata.locationName && (
                                            <div className="group flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-blue-400"/>
                                                <span>{currentPhoto.metadata.locationName}</span>
                                                {renderCopyButton(currentPhoto.metadata.locationName)}
                                                {currentPhoto.metadata.latitude && currentPhoto.metadata.longitude && (
                                                    <div className="group/coord flex items-center gap-1">
                                                        <span className="text-xs text-muted-foreground">
                                                            ({currentPhoto.metadata.latitude.toFixed(4)}, {currentPhoto.metadata.longitude.toFixed(4)})
                                                        </span>
                                                        {renderCopyButton(`${currentPhoto.metadata.latitude}, ${currentPhoto.metadata.longitude}`)}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {currentPhoto.metadata.date && (
                                            <div className="group flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-green-400"/>
                                                <span>{currentPhoto.metadata.date}</span>
                                                {renderCopyButton(currentPhoto.metadata.date)}
                                            </div>
                                        )}
                                        {currentPhoto.metadata.taggedPeople && currentPhoto.metadata.taggedPeople.length > 0 && (
                                            <div className="flex items-start gap-2">
                                                <Users className="mt-0.5 h-4 w-4 text-purple-400"/>
                                                <div className="flex flex-wrap gap-1">
                                                    {currentPhoto.metadata.taggedPeople.map((person, index) => (
                                                        <div key={index} className="group relative">
                                                            <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs">
                                                                {person}
                                                                <button
                                                                    onClick={() => copyToClipboard(person)}
                                                                    className="opacity-0 transition-opacity group-hover:opacity-100"
                                                                >
                                                                    {copiedText === person ? (
                                                                        <Check className="h-3 w-3 text-green-500"/>
                                                                    ) : (
                                                                        <Copy className="h-3 w-3"/>
                                                                    )}
                                                                </button>
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center gap-2 py-4 text-muted-foreground">
                                        <Info className="h-8 w-8 opacity-20"/>
                                        <p className="font-medium">메타데이터 없음</p>
                                        <p className="text-xs opacity-70">이 사진에는 상세 정보가 없습니다.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex h-24 shrink-0 items-center overflow-hidden border-t border-border bg-background/40 backdrop-blur-sm select-none">
                    <div
                        ref={scrollRef}
                        onMouseDown={handleMouseDown}
                        onMouseLeave={handleMouseLeave}
                        onMouseUp={handleMouseUp}
                        onMouseMove={handleMouseMove}
                        className={cn(
                            "h-full w-full cursor-default overflow-x-auto overflow-y-hidden whitespace-nowrap scrollbar-none",
                            isDragging && "cursor-grabbing"
                        )}
                    >
                        <div
                            className={cn(
                                "flex h-full min-w-full items-center space-x-2 p-4",
                                isCentered ? "justify-center" : "justify-start"
                            )}
                        >
                            {photoItems.map((photoItem, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleThumbnailClick(index)}
                                    draggable={false}
                                    data-index={index}
                                    className={cn(
                                        "relative h-16 w-28 shrink-0 overflow-hidden rounded-sm ring-offset-background focus:outline-none",
                                        currentIndex === index
                                            ? "z-10 scale-110 opacity-100 ring-2 ring-primary ring-offset-2"
                                            : "opacity-60 hover:opacity-100"
                                    )}
                                >
                                    <div className="pointer-events-none absolute inset-0 bg-accent/10"/>
                                    <LazyImage
                                        src={photoItem.src}
                                        alt=""
                                        fill
                                        className="pointer-events-none object-contain"
                                        draggable={false}
                                        unoptimized
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

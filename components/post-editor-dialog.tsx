"use client";

import {useQueryClient} from "@tanstack/react-query";
import {
    ArrowLeft,
    ArrowRight,
    GripVertical,
    Image as ImageIcon,
    Loader2,
    Plus,
    Upload,
    X,
} from "lucide-react";
import Image from "next/image";
import type {ChangeEvent, DragEvent, KeyboardEvent} from "react";
import {useCallback, useEffect, useRef, useState} from "react";
import {toast} from "sonner";

import {PhotoDto} from "@/dto/photo-dto";
import {GetPhotoUrl, cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    type CarouselApi,
} from "@/components/ui/carousel";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Textarea} from "@/components/ui/textarea";

type ExistingPhotoDraft = {
    id: string;
    kind: "existing";
    previewUrl: string;
    photo: PhotoDto;
};

type NewPhotoDraft = {
    id: string;
    kind: "new";
    previewUrl: string;
    file: File;
};

type PhotoDraft = ExistingPhotoDraft | NewPhotoDraft;

interface PostEditorDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: "create" | "edit";
    groupUuid: string;
    postUuid?: string;
    initialContent?: string | null;
    initialPhotos?: PhotoDto[] | null;
    onSubmitted?: (result: {content: string; photoCount: number}) => void | Promise<void>;
}

function createInitialPhotos(groupUuid: string, postUuid: string | undefined, photos: PhotoDto[] | null | undefined): PhotoDraft[] {
    if (!postUuid || !photos?.length) {
        return [];
    }

    return [...photos]
        .sort((a, b) => a.sortOrder - b.sortOrder || a.photoUuid.localeCompare(b.photoUuid))
        .map((photo) => ({
            id: `existing:${photo.photoUuid}`,
            kind: "existing" as const,
            previewUrl: GetPhotoUrl(groupUuid, postUuid, photo.photoUuid, photo.format),
            photo,
        }));
}

function revokeDraftUrl(photo: PhotoDraft) {
    if (photo.kind === "new") {
        URL.revokeObjectURL(photo.previewUrl);
    }
}

function moveItem<T>(items: T[], fromIndex: number, toIndex: number): T[] {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= items.length || toIndex >= items.length) {
        return items;
    }

    const next = [...items];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    return next;
}

export default function PostEditorDialog({
    open,
    onOpenChange,
    mode,
    groupUuid,
    postUuid,
    initialContent = "",
    initialPhotos = [],
    onSubmitted,
}: PostEditorDialogProps) {
    const initialDraftPhotos = createInitialPhotos(groupUuid, postUuid, initialPhotos);

    const [content, setContent] = useState(initialContent ?? "");
    const [photos, setPhotos] = useState<PhotoDraft[]>(initialDraftPhotos);
    const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(initialDraftPhotos[0]?.id ?? null);
    const [draggingPhotoId, setDraggingPhotoId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewApi, setPreviewApi] = useState<CarouselApi>();

    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const photosRef = useRef<PhotoDraft[]>(photos);
    const selectedPhotoIdRef = useRef<string | null>(selectedPhotoId);
    photosRef.current = photos;
    selectedPhotoIdRef.current = selectedPhotoId;

    useEffect(() => {
        return () => {
            photosRef.current.forEach(revokeDraftUrl);
        };
    }, []);

    const selectedPhoto = photos.find((photo) => photo.id === selectedPhotoId) ?? photos[0] ?? null;
    const selectedIndex = selectedPhoto ? photos.findIndex((photo) => photo.id === selectedPhoto.id) : -1;

    const moveSelectedPhotoFocus = useCallback((direction: -1 | 1) => {
        if (selectedIndex < 0) {
            return;
        }

        const nextIndex = selectedIndex + direction;
        if (nextIndex < 0 || nextIndex >= photos.length) {
            return;
        }

        setSelectedPhotoId(photos[nextIndex].id);
    }, [photos, selectedIndex]);

    const handlePreviewAreaKeyDown = (event: KeyboardEvent<HTMLElement>) => {
        if (event.key === "ArrowLeft") {
            event.preventDefault();
            previewApi?.scrollPrev();
        }

        if (event.key === "ArrowRight") {
            event.preventDefault();
            previewApi?.scrollNext();
        }
    };

    useEffect(() => {
        if (!previewApi) {
            return;
        }

        const syncSelectedPhoto = () => {
            const nextIndex = previewApi.selectedScrollSnap();
            const nextPhoto = photosRef.current[nextIndex];
            if (nextPhoto && nextPhoto.id !== selectedPhotoIdRef.current) {
                setSelectedPhotoId(nextPhoto.id);
            }
        };

        previewApi.on("select", syncSelectedPhoto);
        previewApi.on("reInit", syncSelectedPhoto);

        return () => {
            previewApi.off("select", syncSelectedPhoto);
            previewApi.off("reInit", syncSelectedPhoto);
        };
    }, [previewApi]);

    useEffect(() => {
        if (!previewApi || selectedIndex < 0) {
            return;
        }

        if (previewApi.selectedScrollSnap() !== selectedIndex) {
            previewApi.scrollTo(selectedIndex);
        }
    }, [previewApi, selectedIndex]);

    const handleThumbnailDragStart = (event: DragEvent<HTMLDivElement>, photoId: string) => {
        setDraggingPhotoId(photoId);
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setDragImage(
            event.currentTarget,
            event.currentTarget.clientWidth / 2,
            event.currentTarget.clientHeight / 2
        );
    };

    const addFiles = (files: File[]) => {
        const imageFiles = files.filter((file) => file.type.startsWith("image/"));
        if (imageFiles.length === 0) {
            return;
        }

        const nextPhotos = imageFiles.map((file) => ({
            id: `new:${crypto.randomUUID()}`,
            kind: "new" as const,
            previewUrl: URL.createObjectURL(file),
            file,
        }));

        setPhotos((prev) => [...prev, ...nextPhotos]);
        setSelectedPhotoId((prev) => prev ?? nextPhotos[0]?.id ?? null);
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files) {
            return;
        }

        addFiles(Array.from(event.target.files));
        event.target.value = "";
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        if (event.dataTransfer.files.length > 0) {
            addFiles(Array.from(event.dataTransfer.files));
        }
    };

    const removePhoto = (photoId: string) => {
        setPhotos((prev) => {
            const target = prev.find((photo) => photo.id === photoId);
            if (target) {
                revokeDraftUrl(target);
            }

            const next = prev.filter((photo) => photo.id !== photoId);
            if (selectedPhotoId === photoId) {
                setSelectedPhotoId(next[0]?.id ?? null);
            }
            return next;
        });
    };

    const movePhotoByOffset = (photoId: string, offset: number) => {
        setPhotos((prev) => {
            const currentIndex = prev.findIndex((photo) => photo.id === photoId);
            return moveItem(prev, currentIndex, currentIndex + offset);
        });
    };

    const movePhotoTo = (fromId: string, toId: string) => {
        if (fromId === toId) {
            return;
        }

        setPhotos((prev) => {
            const fromIndex = prev.findIndex((photo) => photo.id === fromId);
            const toIndex = prev.findIndex((photo) => photo.id === toId);
            return moveItem(prev, fromIndex, toIndex);
        });
    };

    const handleSubmit = async () => {
        if (isSubmitting) {
            return;
        }

        if (photos.length === 0 && content.trim().length === 0) {
            toast.error("글 내용이나 사진 중 하나는 있어야 합니다.");
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append("content", content);

            let endpoint = "/api/group/post";

            if (mode === "create") {
                formData.append("groupUuid", groupUuid);
                photos.forEach((photo) => {
                    if (photo.kind === "new") {
                        formData.append("photos", photo.file);
                    }
                });
            } else {
                if (!postUuid) {
                    throw new Error("수정할 게시글 정보가 올바르지 않습니다.");
                }

                endpoint = "/api/group/update-post";
                formData.append("postUuid", postUuid);
                formData.append(
                    "photoOrder",
                    JSON.stringify(
                        photos.map((photo) =>
                            photo.kind === "existing"
                                ? `existing:${photo.photo.photoUuid}`
                                : `new:${photo.id}`
                        )
                    )
                );

                photos.forEach((photo) => {
                    if (photo.kind === "new") {
                        formData.append("newPhotoClientIds", photo.id);
                        formData.append("newPhotos", photo.file);
                    }
                });
            }

            const response = await fetch(endpoint, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "저장에 실패했습니다.");
            }

            toast.success(mode === "create" ? "게시글을 작성했습니다." : "게시글을 수정했습니다.");
            await queryClient.invalidateQueries({queryKey: ["feed"]});
            await onSubmitted?.({content, photoCount: photos.length});
            onOpenChange(false);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "저장에 실패했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const title = mode === "create" ? "게시글 작성" : "게시글 수정";
    const description = mode === "create"
        ? "사진을 추가하고 순서를 정한 뒤 글을 함께 작성할 수 있습니다."
        : "사진을 추가하거나 삭제하고 순서를 바꾼 뒤 글까지 한 번에 수정할 수 있습니다.";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="h-[min(92vh,980px)] w-[calc(100vw-1rem)] max-w-none grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden border-border/70 p-0 sm:w-[min(96vw,1320px)] sm:max-w-[min(96vw,1320px)]">
                <div className="border-b border-border/60 bg-gradient-to-r from-muted/70 via-background to-muted/40 px-5 py-3 sm:px-6 sm:py-4">
                    <DialogHeader>
                        <DialogTitle className="text-lg sm:text-xl">{title}</DialogTitle>
                        <DialogDescription>{description}</DialogDescription>
                    </DialogHeader>
                </div>

                <div className="grid min-h-0 min-w-0 flex-1 gap-0 overflow-hidden bg-background xl:grid-cols-[minmax(0,1fr)_420px] 2xl:grid-cols-[minmax(0,1fr)_440px]">
                    <section
                        className="flex h-full min-h-0 min-w-0 flex-col gap-4 overflow-hidden border-b border-border/50 bg-background p-4 sm:p-5 xl:border-r xl:border-b-0 xl:p-6"
                        onKeyDownCapture={handlePreviewAreaKeyDown}
                    >
                        <div className="mx-auto grid w-full max-w-[760px] grid-cols-[48px_minmax(0,1fr)_48px] items-center gap-3 sm:grid-cols-[56px_minmax(0,1fr)_56px]">
                            <div className="flex justify-center">
                                {selectedPhoto && photos.length > 1 && (
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="secondary"
                                        className="h-11 w-11 rounded-full border border-border/70 bg-background/92 shadow-sm"
                                        onClick={() => moveSelectedPhotoFocus(-1)}
                                        disabled={selectedIndex <= 0}
                                    >
                                        <ArrowLeft className="h-5 w-5"/>
                                    </Button>
                                )}
                            </div>

                            <div
                                onDragOver={(event) => event.preventDefault()}
                                onDrop={handleDrop}
                                tabIndex={0}
                                className={cn(
                                    "relative flex aspect-video w-full flex-none items-center justify-center overflow-hidden rounded-2xl border border-dashed select-none",
                                    selectedPhoto ? "border-border bg-background" : "border-border/70 bg-gradient-to-br from-background via-muted/40 to-background"
                                )}
                            >
                                {selectedPhoto ? (
                                    <>
                                        <Carousel
                                            setApi={setPreviewApi}
                                            className="h-full w-full"
                                            opts={{
                                                loop: false,
                                                align: "start",
                                            }}
                                        >
                                            <CarouselContent className="-ml-0 h-full">
                                                {photos.map((photo, index) => (
                                                    <CarouselItem key={photo.id} className="pl-0">
                                                        <div className="relative h-full w-full">
                                                            <Image
                                                                src={photo.previewUrl}
                                                                alt={`selected-photo-${index + 1}`}
                                                                fill
                                                                className="object-contain p-4"
                                                                unoptimized
                                                                draggable={false}
                                                                priority={index === selectedIndex}
                                                            />
                                                        </div>
                                                    </CarouselItem>
                                                ))}
                                            </CarouselContent>
                                        </Carousel>
                                        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent p-4 text-white">
                                            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-white/70">
                                                <span>{selectedIndex + 1}</span>
                                                <span>/</span>
                                                <span>{photos.length}</span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex h-full w-full flex-col items-center justify-center gap-4 px-8 py-12 text-center"
                                    >
                                        <div className="rounded-full border border-border bg-background/80 p-4 shadow-sm">
                                            <Upload className="h-8 w-8 text-muted-foreground"/>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-base font-medium">여기에 사진을 놓거나 파일을 선택하세요</p>
                                            <p className="text-sm text-muted-foreground">
                                                여기에서 보이는 순서가 게시글 사진 순서가 됩니다.
                                            </p>
                                        </div>
                                    </button>
                                )}
                            </div>

                            <div className="flex justify-center">
                                {selectedPhoto && photos.length > 1 && (
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="secondary"
                                        className="h-11 w-11 rounded-full border border-border/70 bg-background/92 shadow-sm"
                                        onClick={() => moveSelectedPhotoFocus(1)}
                                        disabled={selectedIndex >= photos.length - 1}
                                    >
                                        <ArrowRight className="h-5 w-5"/>
                                    </Button>
                                )}
                            </div>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />

                        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[24px] border border-border/60 bg-muted/10 p-3 sm:p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <div className="text-sm font-semibold tracking-tight">사진 순서</div>
                                        <div className="inline-flex items-center rounded-full border border-border/70 bg-background px-2.5 py-1 text-[11px] font-medium text-foreground shadow-sm">
                                            <span className="tabular-nums">{photos.length}</span>
                                            <span className="ml-1 text-muted-foreground">장</span>
                                        </div>
                                    </div>
                                    <div className="text-xs text-muted-foreground">드래그하거나 화살표 버튼으로 사진 순서를 조정하세요.</div>
                                </div>
                                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                                    <Plus className="mr-2 h-4 w-4"/>
                                    사진 추가
                                </Button>
                            </div>

                            <div
                                tabIndex={0}
                                className="mt-4 min-h-0 min-w-0 flex-1 overflow-x-auto overflow-y-hidden"
                            >
                                <div className="flex min-h-full w-max min-w-full items-stretch gap-3 pb-3 pr-1">
                                    {photos.map((photo, index) => (
                                        <div
                                            key={photo.id}
                                            draggable
                                            onDragStart={(event) => handleThumbnailDragStart(event, photo.id)}
                                            onDragEnd={() => setDraggingPhotoId(null)}
                                            onDragOver={(event) => event.preventDefault()}
                                            onDrop={() => {
                                                if (draggingPhotoId) {
                                                    movePhotoTo(draggingPhotoId, photo.id);
                                                }
                                            }}
                                            className={cn(
                                                "group relative flex w-[176px] shrink-0 flex-col overflow-hidden rounded-2xl border bg-background shadow-sm transition lg:w-[184px]",
                                                selectedPhoto?.id === photo.id && "border-foreground shadow-md",
                                                draggingPhotoId === photo.id && "opacity-50"
                                            )}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => setSelectedPhotoId(photo.id)}
                                                className="relative block aspect-video w-full bg-muted/20"
                                            >
                                                <Image
                                                    src={photo.previewUrl}
                                                    alt={`photo-${index + 1}`}
                                                    fill
                                                    className="object-contain p-2"
                                                    unoptimized
                                                    draggable={false}
                                                />
                                            </button>
                                            <div className="border-t border-border/60 p-2.5">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <GripVertical className="h-3.5 w-3.5"/>
                                                        <span>{index + 1}</span>
                                                    </div>
                                                    <div className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                                                        {photo.kind === "existing" ? "기존" : "신규"}
                                                    </div>
                                                </div>
                                                <div className="mt-2 flex items-center gap-1">
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8"
                                                        disabled={index === 0}
                                                        onClick={() => movePhotoByOffset(photo.id, -1)}
                                                    >
                                                        <ArrowLeft className="h-4 w-4"/>
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8"
                                                        disabled={index === photos.length - 1}
                                                        onClick={() => movePhotoByOffset(photo.id, 1)}
                                                    >
                                                        <ArrowRight className="h-4 w-4"/>
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        variant="ghost"
                                                        className="ml-auto h-8 w-8 text-muted-foreground hover:text-destructive"
                                                        onClick={() => removePhoto(photo.id)}
                                                    >
                                                        <X className="h-4 w-4"/>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex h-[156px] w-[176px] shrink-0 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 bg-background text-muted-foreground transition hover:border-foreground/40 hover:text-foreground lg:h-[162px] lg:w-[184px]"
                                    >
                                        <ImageIcon className="h-7 w-7"/>
                                        <span className="text-sm font-medium">사진 추가</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="min-h-0 min-w-0 overflow-y-auto px-4 pb-4 pt-0 sm:px-5 sm:pb-5 sm:pt-0 xl:px-5 xl:pb-5 xl:pt-0">
                        <div className="flex flex-col gap-4 xl:mx-auto xl:w-full xl:max-w-[408px] 2xl:max-w-[424px]">
                            <div className="rounded-2xl border border-border/60 bg-background p-4">
                                <div className="mb-3 text-sm font-medium">글 내용</div>
                                <Textarea
                                    value={content}
                                    onChange={(event) => setContent(event.target.value)}
                                    placeholder="사진과 함께 남길 이야기를 적어보세요..."
                                    className="min-h-[220px] resize-none border-0 bg-transparent px-3 py-3 shadow-none focus-visible:ring-0"
                                />
                            </div>

                            <div className="rounded-2xl border border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground">
                                <div className="font-medium text-foreground">편집 안내</div>
                                <div className="mt-2">사진을 선택해 크게 보고, 드래그로 순서를 바꾸고, 필요 없는 사진은 바로 제거할 수 있습니다.</div>
                            </div>
                        </div>
                    </section>
                </div>

                <DialogFooter className="border-t border-border/60 px-5 py-3 sm:px-6">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        취소
                    </Button>
                    <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                저장 중
                            </>
                        ) : mode === "create" ? (
                            "게시하기"
                        ) : (
                            "수정 완료"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

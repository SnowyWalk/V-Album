"use client";

import {useEffect, useRef, useState} from "react";
import {createPortal} from "react-dom";
import Image from "next/image";
import {
    Bookmark,
    ChevronLeft,
    ChevronRight,
    ImageOff,
    MessageCircle,
    SendHorizontal,
    X,
} from "lucide-react";
import {toast} from "sonner";

import LikeButton from "@/components/feed/like-button";
import PostControlMenu from "@/components/feed/post-control-menu";
import TimeAgo from "@/components/time-ago";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Textarea} from "@/components/ui/textarea";
import {FeedItemDto} from "@/dto/feed-item-dto";
import {useMe} from "@/hooks/use-me";
import {useUser} from "@/hooks/use-user";
import {cn, formatCount, GetPhotoUrl} from "@/lib/utils";

export type LocalPostComment = {
    commentUuid: string;
    body: string;
    createdAt: string;
};

type PostDetailModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    feedItem: FeedItemDto;
    initialPhotoIndex?: number;
    postContent: string;
    bookmarked: boolean;
    onToggleBookmark: () => void;
    onEdit: () => void;
    onDelete: () => void;
    comments: LocalPostComment[];
    onAddComment: (body: string) => void;
    focusCommentComposer?: boolean;
};

const KR = {
    title: "게시물 상세 보기",
    noPhotos: "등록된 사진이 없습니다.",
    loadingAuthor: "작성자 불러오는 중",
    authorFallback: "작성자",
    meFallback: "나",
    signedInUser: "로그인 사용자",
    composerHint: "댓글을 남겨보세요.",
    composerPlaceholder: "이 게시물에 댓글 달기...",
    submitComment: "댓글 게시",
    comments: "댓글",
    commentPosted: "댓글을 남겼습니다.",
    firstComment: "첫 댓글을 남겨보세요.",
    chars: "자",
    countSuffix: "개",
    photoAria: (index: number) => `${index}번째 사진 보기`,
    close: "닫기",
};

const formatAbsoluteDateTime = (value: string) =>
    new Intl.DateTimeFormat("ko-KR", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));

export default function PostDetailModal({
    open,
    onOpenChange,
    feedItem,
    initialPhotoIndex = 0,
    postContent,
    bookmarked,
    onToggleBookmark,
    onEdit,
    onDelete,
    comments,
    onAddComment,
    focusCommentComposer = false,
}: PostDetailModalProps) {
    const {data: author} = useUser(open ? feedItem.post.userUuid : null);
    const {data: me} = useMe();
    const [commentDraft, setCommentDraft] = useState("");
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(initialPhotoIndex);
    const [dialogContainer, setDialogContainer] = useState<HTMLDivElement | null>(null);
    const commentInputRef = useRef<HTMLTextAreaElement | null>(null);

    const photos = [...(feedItem.photos ?? [])].sort(
        (a, b) => a.sortOrder - b.sortOrder || a.photoUuid.localeCompare(b.photoUuid)
    );
    const photoCount = photos.length;
    const currentPhoto = photos[currentPhotoIndex] ?? null;

    useEffect(() => {
        if (!open) {
            return;
        }

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onOpenChange(false);
                return;
            }

            if (photoCount <= 1) {
                return;
            }

            if (event.key === "ArrowLeft") {
                setCurrentPhotoIndex((prev) => (prev - 1 + photoCount) % photoCount);
            } else if (event.key === "ArrowRight") {
                setCurrentPhotoIndex((prev) => (prev + 1) % photoCount);
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [onOpenChange, open, photoCount]);

    useEffect(() => {
        if (!open) {
            return;
        }

        if (photoCount === 0) {
            setCurrentPhotoIndex(0);
            return;
        }

        const nextIndex = Math.min(Math.max(initialPhotoIndex, 0), photoCount - 1);
        setCurrentPhotoIndex(nextIndex);
    }, [initialPhotoIndex, open, photoCount]);

    useEffect(() => {
        if (!focusCommentComposer || !open) {
            return;
        }

        const timer = window.setTimeout(() => {
            commentInputRef.current?.focus();
        }, 80);

        return () => window.clearTimeout(timer);
    }, [focusCommentComposer, open]);

    const handleSubmitComment = () => {
        const nextBody = commentDraft.trim();
        if (!nextBody) {
            return;
        }

        onAddComment(nextBody);
        setCommentDraft("");
        toast.success(KR.commentPosted);
    };

    const handlePrevPhoto = () => {
        if (photoCount <= 1) {
            return;
        }

        setCurrentPhotoIndex((prev) => (prev - 1 + photoCount) % photoCount);
    };

    const handleNextPhoto = () => {
        if (photoCount <= 1) {
            return;
        }

        setCurrentPhotoIndex((prev) => (prev + 1) % photoCount);
    };

    if (!open || typeof document === "undefined") {
        return null;
    }

    return createPortal(
        <div
            onClick={() => onOpenChange(false)}
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 70,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0, 0, 0, 0.72)",
                backdropFilter: "blur(8px)",
                padding: "16px",
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label={KR.title}
                ref={setDialogContainer}
                onClick={(event) => event.stopPropagation()}
                style={{
                    direction: "ltr",
                    display: "grid",
                    gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
                    width: "min(1680px, calc(100vw - 32px))",
                    height: "min(96vh, calc(100vh - 32px))",
                    minWidth: 0,
                    minHeight: 0,
                    overflow: "hidden",
                    borderRadius: "24px",
                    background: "var(--background)",
                    boxShadow: "0 24px 80px rgba(0, 0, 0, 0.35)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                }}
            >
                <section
                    style={{
                        position: "relative",
                        minWidth: 0,
                        minHeight: 0,
                        background: "#050505",
                        overflow: "hidden",
                    }}
                >
                    {currentPhoto ? (
                        <>
                            <div
                                style={{
                                    display: "flex",
                                    width: "100%",
                                    height: "100%",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: "24px",
                                }}
                            >
                                <div
                                    style={{
                                        position: "relative",
                                        width: "100%",
                                        height: "100%",
                                    }}
                                >
                                    <Image
                                        src={GetPhotoUrl(feedItem.post, currentPhoto)}
                                        alt=""
                                        fill
                                        priority={currentPhotoIndex === initialPhotoIndex}
                                        sizes="50vw"
                                        unoptimized
                                        draggable={false}
                                        style={{
                                            objectFit: "contain",
                                            userSelect: "none",
                                        }}
                                    />
                                </div>
                            </div>

                            {photoCount > 1 && (
                                <>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="icon"
                                        className="absolute left-4 top-1/2 z-10 h-11 w-11 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur"
                                        onClick={handlePrevPhoto}
                                    >
                                        <ChevronLeft className="h-5 w-5"/>
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="icon"
                                        className="absolute right-4 top-1/2 z-10 h-11 w-11 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur"
                                        onClick={handleNextPhoto}
                                    >
                                        <ChevronRight className="h-5 w-5"/>
                                    </Button>
                                    <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-background/70 px-3 py-1.5 backdrop-blur">
                                        {photos.map((photo, index) => (
                                            <button
                                                key={photo.photoUuid}
                                                type="button"
                                                aria-label={KR.photoAria(index + 1)}
                                                onClick={() => setCurrentPhotoIndex(index)}
                                                className={cn(
                                                    "h-2.5 w-2.5 rounded-full transition-all",
                                                    index === currentPhotoIndex
                                                        ? "scale-110 bg-white"
                                                        : "bg-white/35 hover:bg-white/60"
                                                )}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-white/70">
                            <ImageOff className="h-12 w-12"/>
                            <p className="text-sm">{KR.noPhotos}</p>
                        </div>
                    )}
                </section>

                <section
                    className="flex min-h-0 min-w-0 flex-col border-l border-border bg-background"
                    style={{width: "100%", minWidth: 0}}
                >
                    <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4 lg:px-6 lg:py-5">
                        <div className="flex min-w-0 items-center gap-3">
                            <Avatar className="h-11 w-11 border border-border/70">
                                <AvatarImage
                                    src={author?.pic ? `/profile-pics/${author.pic}.png` : undefined}
                                    alt={author?.nickname ?? KR.authorFallback}
                                />
                                <AvatarFallback>{(author?.nickname ?? "A").slice(0, 1)}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                                <div className="truncate text-sm font-semibold">
                                    {author?.nickname ?? KR.loadingAuthor}
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                    <TimeAgo date={feedItem.post.createdAt}/>
                                    <span>&middot;</span>
                                    <span>{formatAbsoluteDateTime(feedItem.post.createdAt)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <PostControlMenu
                                onEdit={onEdit}
                                onDelete={onDelete}
                                triggerClassName="shrink-0"
                                portalContainer={dialogContainer}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-full"
                                onClick={() => onOpenChange(false)}
                            >
                                <X className="h-5 w-5"/>
                                <span className="sr-only">{KR.close}</span>
                            </Button>
                        </div>
                    </div>

                    <ScrollArea className="min-h-0 flex-1">
                        <div className="space-y-5 px-5 py-5 lg:space-y-6 lg:px-6 lg:py-6">
                            {postContent.trim().length > 0 && (
                                <p className="whitespace-pre-wrap text-[15px] leading-7 text-foreground/90">
                                    {postContent}
                                </p>
                            )}

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                    <LikeButton
                                        key={`${feedItem.post.postUuid}-${feedItem.likedByMe}-${feedItem.likeCount}-modal`}
                                        postUuid={feedItem.post.postUuid}
                                        initialLiked={feedItem.likedByMe}
                                        initialLikeCount={feedItem.likeCount}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => commentInputRef.current?.focus()}
                                        className={cn(
                                            "flex items-center gap-1.5 rounded-xl px-2.5 py-2",
                                            "text-muted-foreground transition-all duration-150",
                                            "hover:bg-accent hover:text-foreground active:scale-90"
                                        )}
                                    >
                                        <MessageCircle className="h-4.5 w-4.5"/>
                                        <span className="text-xs font-medium tabular-nums">
                                            {formatCount(comments.length)}
                                        </span>
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={onToggleBookmark}
                                    className={cn(
                                        "rounded-xl px-2.5 py-2 transition-all duration-150 active:scale-90",
                                        bookmarked
                                            ? "text-blue-500 hover:bg-blue-500/10 dark:text-blue-400"
                                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                    )}
                                >
                                    <Bookmark className={cn("h-4.5 w-4.5", bookmarked && "fill-current")}/>
                                </button>
                            </div>

                            <div className="rounded-2xl border border-border bg-muted/20 p-4">
                                <div className="mb-3 flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage
                                            src={me?.pic ? `/profile-pics/${me.pic}.png` : undefined}
                                            alt={me?.nickname ?? KR.meFallback}
                                        />
                                        <AvatarFallback>{(me?.nickname ?? KR.meFallback).slice(0, 1)}</AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <div className="truncate text-sm font-medium">
                                            {me?.nickname ?? KR.signedInUser}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {KR.composerHint}
                                        </div>
                                    </div>
                                </div>
                                <Textarea
                                    ref={commentInputRef}
                                    value={commentDraft}
                                    onChange={(event) => setCommentDraft(event.target.value)}
                                    placeholder={KR.composerPlaceholder}
                                    className="min-h-24 resize-none border-0 bg-background"
                                />
                                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                                    <span>{commentDraft.trim().length}{KR.chars}</span>
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={handleSubmitComment}
                                        disabled={!commentDraft.trim()}
                                    >
                                        <SendHorizontal className="h-4 w-4"/>
                                        {KR.submitComment}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold">{KR.comments}</h3>
                                    <span className="text-xs text-muted-foreground">
                                        {comments.length}{KR.countSuffix}
                                    </span>
                                </div>

                                {comments.length > 0 ? (
                                    comments.map((comment) => (
                                        <div
                                            key={comment.commentUuid}
                                            className="rounded-2xl border border-border bg-card px-4 py-3"
                                        >
                                            <div className="flex items-start gap-3">
                                                <Avatar className="mt-0.5 h-8 w-8">
                                                    <AvatarImage
                                                        src={me?.pic ? `/profile-pics/${me.pic}.png` : undefined}
                                                        alt={me?.nickname ?? KR.meFallback}
                                                    />
                                                    <AvatarFallback>{(me?.nickname ?? KR.meFallback).slice(0, 1)}</AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="text-sm font-medium">
                                                            {me?.nickname ?? KR.meFallback}
                                                        </span>
                                                        <TimeAgo
                                                            date={comment.createdAt}
                                                            className="text-xs text-muted-foreground"
                                                        />
                                                    </div>
                                                    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-foreground/85">
                                                        {comment.body}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
                                        {KR.firstComment}
                                    </div>
                                )}
                            </div>
                        </div>
                    </ScrollArea>
                </section>
            </div>
        </div>,
        document.body
    );
}

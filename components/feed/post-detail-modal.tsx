"use client";

import {useEffect, useMemo, useRef, useState} from "react";
import {createPortal} from "react-dom";
import {
    Bookmark,
    ImageOff,
    MessageCircle,
    SendHorizontal,
    X,
} from "lucide-react";
import {toast} from "sonner";

import LikeButton from "@/components/feed/like-button";
import {PhotoPreviewViewer} from "@/components/photo-preview-viewer";
import PostControlMenu from "@/components/feed/post-control-menu";
import TimeAgo from "@/components/time-ago";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Skeleton} from "@/components/ui/skeleton";
import {Textarea} from "@/components/ui/textarea";
import {FeedItemDto} from "@/dto/feed-item-dto";
import {useUser} from "@/hooks/use-user";
import {cn, formatCount, GetPhotoUrl} from "@/lib/utils";

export type LocalPostComment = {
    commentUuid: string;
    userUuid: string;
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
    commentsLoading?: boolean;
    commentsSubmitting?: boolean;
    onAddComment: (body: string) => Promise<void>;
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
    comments: (count: number) => `댓글 ${count}개`,
    commentPosted: "댓글을 남겼습니다.",
    firstComment: "첫 댓글을 남겨보세요.",
    photoAria: (index: number) => `${index}번째 사진 보기`,
    close: "닫기",
};

const formatAbsoluteDateTime = (value: string) =>
    new Intl.DateTimeFormat("ko-KR", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));

function CommentAuthor({userUuid}: {userUuid: string}) {
    const {data: user, isLoading} = useUser(userUuid);

    if (isLoading) {
        return (
            <div className="flex items-center gap-2.5">
                <Avatar size="sm" className="border border-border/70">
                    <Skeleton className="h-full w-full"/>
                </Avatar>
                <Skeleton className="h-4 w-20"/>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2.5">
            <Avatar size="sm" className="border border-border/70">
                <AvatarImage
                    src={user?.pic ? `/profile-pics/${user.pic}.png` : undefined}
                    alt={user?.nickname ?? "User"}
                />
                <AvatarFallback>{(user?.nickname ?? "U").slice(0, 1)}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-foreground/90">
                {user?.nickname ?? "알 수 없는 사용자"}
            </span>
        </div>
    );
}

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
    commentsLoading = false,
    commentsSubmitting = false,
    onAddComment,
    focusCommentComposer = false,
}: PostDetailModalProps) {
    const {data: author} = useUser(open ? feedItem.post.userUuid : null);
    const [commentDraft, setCommentDraft] = useState("");
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(initialPhotoIndex);
    const commentInputRef = useRef<HTMLTextAreaElement | null>(null);

    const photos = useMemo(
        () => [...(feedItem.photos ?? [])].sort(
            (a, b) => a.sortOrder - b.sortOrder || a.photoUuid.localeCompare(b.photoUuid)
        ),
        [feedItem.photos]
    );
    const photoCount = photos.length;
    const photoItems = useMemo(
        () => photos.map((photo, index) => ({
            id: photo.photoUuid,
            src: GetPhotoUrl(feedItem.post, photo),
            alt: KR.photoAria(index + 1),
        })),
        [feedItem.post, photos]
    );

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
                setCurrentPhotoIndex((prev) => Math.max(prev - 1, 0));
            } else if (event.key === "ArrowRight") {
                setCurrentPhotoIndex((prev) => Math.min(prev + 1, photoCount - 1));
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

        const timer = window.setTimeout(() => {
            if (photoCount === 0) {
                setCurrentPhotoIndex(0);
                return;
            }

            const nextIndex = Math.min(Math.max(initialPhotoIndex, 0), photoCount - 1);
            setCurrentPhotoIndex(nextIndex);
        }, 0);

        return () => window.clearTimeout(timer);
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

    const handleSubmitComment = async () => {
        const nextBody = commentDraft.trim();
        if (!nextBody) {
            return;
        }

        try {
            await onAddComment(nextBody);
            setCommentDraft("");
            toast.success(KR.commentPosted, {
                position: "top-center",
            });
        } catch {
            return;
        }
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
                <section className="flex min-h-0 min-w-0 items-center justify-center overflow-hidden bg-card p-4 sm:p-6">
                    <PhotoPreviewViewer
                        items={photoItems}
                        selectedIndex={currentPhotoIndex}
                        onSelectedIndexChange={setCurrentPhotoIndex}
                        priorityIndex={initialPhotoIndex}
                        sizes="50vw"
                        emptyContent={
                            <>
                                <ImageOff className="h-12 w-12 text-muted-foreground"/>
                                <p className="text-sm text-muted-foreground">{KR.noPhotos}</p>
                            </>
                        }
                    />
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
                        <div className="px-5 py-6 lg:px-6 lg:py-7">
                            {postContent.trim().length > 0 && (
                                <p className="pt-3 whitespace-pre-wrap text-[15px] leading-7 text-foreground/90 lg:mb-14 mb-10">
                                    {postContent}
                                </p>
                            )}

                            <div className="mb-6 flex items-center justify-between pt-3 lg:mb-8">
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

                            <div className="space-y-6">
                                <h3 className="text-sm font-semibold">{KR.comments(comments?.length)}</h3>

                                <div className="space-y-3">
                                    {commentsLoading ? (
                                        Array.from({length: 3}).map((_, index) => (
                                            <div
                                                key={`comment-skeleton-${index}`}
                                                className="rounded-2xl border border-border/80 bg-background/85 px-4 py-3"
                                            >
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <Skeleton className="h-3 w-16"/>
                                                        <Skeleton className="h-3 w-28"/>
                                                    </div>
                                                    <div className="mt-3 space-y-2">
                                                        <Skeleton className="h-4 w-11/12"/>
                                                        <Skeleton className="h-4 w-4/5"/>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : comments.length > 0 ? (
                                        comments.map((comment) => (
                                            <div
                                                key={comment.commentUuid}
                                                className="rounded-2xl border border-border/80 bg-background/85 px-4 py-3"
                                            >
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <CommentAuthor userUuid={comment.userUuid}/>
                                                        <TimeAgo
                                                            date={comment.createdAt}
                                                            className="text-xs text-muted-foreground"
                                                        />
                                                    </div>
                                                    <p className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-foreground/85">
                                                        {comment.body}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="rounded-2xl border border-dashed border-border px-4 text-center text-sm text-muted-foreground py-16">
                                            {KR.firstComment}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </ScrollArea>

                    <div className="border-t border-border bg-background/95 px-5 py-4 lg:px-6 lg:py-5">
                        <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/20 p-2">
                            <div className="min-w-0 flex-1 rounded-2xl bg-background">
                                <Textarea
                                    ref={commentInputRef}
                                    value={commentDraft}
                                    onChange={(event) => setCommentDraft(event.target.value)}
                                    placeholder={KR.composerPlaceholder}
                                    rows={4}
                                    className="min-h-4 resize-none border-0 bg-transparent p-2 shadow-none focus-visible:ring-0"
                                />
                            </div>
                            <Button
                                type="button"
                                size="icon"
                                className="h-11 w-11 shrink-0 self-center rounded-2xl"
                                onClick={handleSubmitComment}
                                disabled={!commentDraft.trim() || commentsSubmitting}
                            >
                                <SendHorizontal className="h-4.5 w-4.5"/>
                                <span className="sr-only">{KR.submitComment}</span>
                            </Button>
                        </div>
                    </div>
                </section>
            </div>
        </div>,
        document.body
    );
}

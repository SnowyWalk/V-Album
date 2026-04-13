"use client";

import type {KeyboardEvent, SyntheticEvent} from "react";
import {useCallback, useMemo, useState} from "react";
import {useQueryClient} from "@tanstack/react-query";
import {Bookmark, MessageCircle, Share2, Users} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {toast} from "sonner";

import LikeButton from "@/components/feed/like-button";
import PostControlMenu from "@/components/feed/post-control-menu";
import PostDetailModal, {LocalPostComment} from "@/components/feed/post-detail-modal";
import PostPhotoGrid from "@/components/feed/post-photo-grid";
import PostEditorDialog from "@/components/post-editor-dialog";
import TimeAgo from "@/components/time-ago";
import {ImageViewer, PhotoItem} from "@/components/image-viewer";
import {Skeleton} from "@/components/ui/skeleton";
import UserAvatar from "@/components/user-avatar";
import {FeedItemDto} from "@/dto/feed-item-dto";
import {cn, formatCount, GetPhotoUrl} from "@/lib/utils";

const KR = {
    deleteFailed: "게시글 삭제에 실패했습니다.",
    deleteSuccess: "게시글을 삭제했습니다.",
    deleteError: "삭제 중 오류가 발생했습니다.",
    deleteConfirm: "이 게시물을 삭제할까요?",
};

const requestDeletePost = async (postUuid: string): Promise<boolean> => {
    try {
        const result = await fetch("/api/group/delete-post", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({postUuid}),
        });

        if (!result.ok) {
            toast.error(KR.deleteFailed);
            return false;
        }

        toast.success(KR.deleteSuccess);
        return true;
    } catch {
        toast.error(KR.deleteError);
        return false;
    }
};

export function PostCardSkeleton({
    showGroupHeader = false,
    index = 0,
}: {
    showGroupHeader?: boolean;
    index?: number;
}) {
    const contentWidths = [
        ["w-11/12", "w-4/5", "w-2/3"],
        ["w-5/6", "w-3/4", "w-1/2"],
        ["w-10/12", "w-2/3", "w-3/5"],
    ] as const;
    const [firstLine, secondLine, thirdLine] = contentWidths[index % contentWidths.length];

    return (
        <article
            aria-hidden="true"
            className="overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm"
        >
            {showGroupHeader && (
                <div className="flex items-center gap-2 border-b border-border/60 bg-muted/40 px-4 py-2">
                    <Skeleton className="h-6 w-6 shrink-0 rounded-full"/>
                    <Skeleton className="h-3 w-24"/>
                </div>
            )}

            <div className="flex items-center justify-between px-4 pb-3 pt-3">
                <div className="flex items-center gap-2.5">
                    <Skeleton className="h-8 w-8 shrink-0 rounded-full"/>
                    <Skeleton className="h-4 w-24"/>
                    <div className="text-muted-foreground">|</div>
                    <Skeleton className="h-4 w-16"/>
                </div>
                <Skeleton className="h-8 w-8 rounded-full"/>
            </div>

            <div className="space-y-2 px-4 pb-3">
                <Skeleton className={`h-4 ${firstLine}`}/>
                <Skeleton className={`h-4 ${secondLine}`}/>
                <Skeleton className={`h-4 ${thirdLine}`}/>
            </div>

            <div className="m-1 overflow-hidden rounded-xl">
                <Skeleton className="aspect-4/3 w-full rounded-none"/>
            </div>

            <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-16 rounded-xl"/>
                    <Skeleton className="h-9 w-16 rounded-xl"/>
                    <Skeleton className="h-9 w-9 rounded-xl"/>
                </div>
                <Skeleton className="h-9 w-9 rounded-xl"/>
            </div>
        </article>
    );
}

type PostCardProps = {
    feedItem: FeedItemDto;
    groupName?: string;
    groupUuid?: string;
    groupPic?: string | null;
    isAllFeed?: boolean;
};

export default function PostCard({
    feedItem,
    groupName,
    groupUuid,
    groupPic,
    isAllFeed = false,
}: PostCardProps) {
    const post = feedItem.post;
    const queryClient = useQueryClient();

    const [bookmarked, setBookmarked] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editDialogKey, setEditDialogKey] = useState(0);
    const [updatedContent, setUpdatedContent] = useState<string | null>(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [detailModalFocusComment, setDetailModalFocusComment] = useState(false);
    const [comments, setComments] = useState<LocalPostComment[]>([]);
    const [imageViewerOpen, setImageViewerOpen] = useState(false);
    const [imageViewerIndex, setImageViewerIndex] = useState(0);

    const photoItems = useMemo<PhotoItem[]>(
        () => [...(feedItem.photos ?? [])]
            .sort((a, b) => a.sortOrder - b.sortOrder || a.photoUuid.localeCompare(b.photoUuid))
            .map((photo) => ({
                src: GetPhotoUrl(post, photo),
            })),
        [feedItem.photos, post]
    );

    const postContent = updatedContent ?? post.content ?? "";
    const commentCount = comments.length;

    const stopEvent = (event: SyntheticEvent) => {
        event.stopPropagation();
    };

    const handleDelete = useCallback(async () => {
        if (!confirm(KR.deleteConfirm)) {
            return;
        }

        const success = await requestDeletePost(post.postUuid);
        if (success) {
            setDetailModalOpen(false);
            setImageViewerOpen(false);
            setIsDeleted(true);
            await queryClient.invalidateQueries({queryKey: ["feed"]});
        }
    }, [post.postUuid, queryClient]);

    const handleOpenEditor = useCallback(() => {
        setEditDialogKey((prev) => prev + 1);
        setEditDialogOpen(true);
    }, []);

    const handleOpenEditorFromDetail = useCallback(() => {
        setDetailModalOpen(false);
        setEditDialogKey((prev) => prev + 1);
        setEditDialogOpen(true);
    }, []);

    const openDetailModal = useCallback((focusCommentComposer = false) => {
        setDetailModalFocusComment(focusCommentComposer);
        setDetailModalOpen(true);
    }, []);

    const openImageViewer = useCallback((photoIndex = 0) => {
        setImageViewerIndex(photoIndex);
        setImageViewerOpen(true);
    }, []);

    const handlePhotoGridClick = useCallback((photoIndex: number) => {
        openImageViewer(photoIndex);
    }, [openImageViewer]);

    const handleAddComment = useCallback((body: string) => {
        setComments((prev) => [
            ...prev,
            {
                commentUuid: crypto.randomUUID(),
                body,
                createdAt: new Date().toISOString(),
            },
        ]);
    }, []);

    const handleCardKeyDown = (event: KeyboardEvent<HTMLElement>) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openDetailModal(false);
        }
    };

    if (isDeleted) return null;

    return (
        <>
            <article
                role="button"
                tabIndex={0}
                onClick={() => openDetailModal(false)}
                onKeyDown={handleCardKeyDown}
                className={cn(
                    "cursor-pointer overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm transition-shadow duration-200",
                    "hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                )}
            >
                {(groupName || isAllFeed) && (
                    groupName ? (
                        <Link
                            href={`/group/${groupUuid}`}
                            onClick={stopEvent}
                            className={cn(
                                "flex items-center gap-2 border-b border-border/60 bg-muted/40 px-4 py-2 transition-colors hover:bg-muted/60",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            )}
                        >
                            <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full border border-border/60 bg-muted">
                                {groupPic ? (
                                    <Image
                                        src={`/group-pics/${groupPic}.png`}
                                        alt={groupName}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                        <Users className="h-3 w-3 text-muted-foreground"/>
                                    </div>
                                )}
                            </div>
                            <div
                                className="text-sm tracking-wide text-muted-foreground"
                                style={{position: "relative", top: "-1px"}}
                            >
                                {groupName}
                            </div>
                        </Link>
                    ) : (
                        <div className="flex items-center gap-2 border-b border-border/60 bg-muted/40 px-4 py-2">
                            <Skeleton className="h-6 w-6 shrink-0 rounded-full"/>
                            <Skeleton className="h-3 w-20"/>
                        </div>
                    )
                )}

                <div className="flex items-center justify-between px-4 pb-3 pt-3">
                    <div className="flex flex-row items-center gap-2.5">
                        <UserAvatar userUuid={post.userUuid}/>
                        <div className="text-muted-foreground">|</div>
                        <div>
                            <TimeAgo date={post.createdAt} className="text-sm text-muted-foreground"/>
                        </div>
                    </div>
                    <div onClick={stopEvent}>
                        <PostControlMenu onEdit={handleOpenEditor} onDelete={handleDelete}/>
                    </div>
                </div>

                {postContent.trim().length > 0 && (
                    <p className="px-4 pb-3 text-[14px] leading-[1.7] tracking-[-0.005em] text-foreground/80">
                        {postContent}
                    </p>
                )}

                <div className="m-1 overflow-hidden rounded-xl">
                    <PostPhotoGrid feedItem={feedItem} onClickPhotoAction={handlePhotoGridClick}/>
                </div>

                <div className="flex items-center justify-between px-3 py-2">
                    <div className="flex items-center" onClick={stopEvent}>
                        <LikeButton
                            key={`${post.postUuid}-${feedItem.likedByMe}-${feedItem.likeCount}-card`}
                            postUuid={post.postUuid}
                            initialLiked={feedItem.likedByMe}
                            initialLikeCount={feedItem.likeCount}
                        />

                        <button
                            type="button"
                            onClick={() => openDetailModal(true)}
                            className={cn(
                                "flex items-center gap-1.5 rounded-xl px-2.5 py-2",
                                "text-muted-foreground transition-all duration-150",
                                "hover:bg-accent hover:text-foreground active:scale-90"
                            )}
                        >
                            <MessageCircle className="h-4.5 w-4.5"/>
                            <span className="text-xs font-medium tabular-nums">{formatCount(commentCount)}</span>
                        </button>

                        <button
                            type="button"
                            className={cn(
                                "flex items-center rounded-xl px-2.5 py-2",
                                "text-muted-foreground transition-all duration-150",
                                "hover:bg-accent hover:text-foreground active:scale-90"
                            )}
                        >
                            <Share2 className="h-4.5 w-4.5"/>
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={(event) => {
                            stopEvent(event);
                            setBookmarked((prev) => !prev);
                        }}
                        className={cn(
                            "flex items-center rounded-xl px-2.5 py-2 transition-all duration-150 active:scale-90",
                            bookmarked
                                ? "text-blue-500 hover:bg-blue-500/10 dark:text-blue-400"
                                : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        )}
                    >
                        <Bookmark
                            className={cn(
                                "h-4.5 w-4.5 transition-all duration-300",
                                bookmarked && "fill-current"
                            )}
                        />
                    </button>
                </div>
            </article>

            {editDialogOpen && (
                <PostEditorDialog
                    key={editDialogKey}
                    open={editDialogOpen}
                    onOpenChange={setEditDialogOpen}
                    mode="edit"
                    groupUuid={post.groupUuid}
                    postUuid={post.postUuid}
                    initialContent={postContent}
                    initialPhotos={feedItem.photos}
                    onSubmitted={({content}) => {
                        setUpdatedContent(content);
                    }}
                />
            )}

            {detailModalOpen && (
                <PostDetailModal
                    open={detailModalOpen}
                    onOpenChange={setDetailModalOpen}
                    feedItem={feedItem}
                    postContent={postContent}
                    bookmarked={bookmarked}
                    onToggleBookmark={() => setBookmarked((prev) => !prev)}
                    onEdit={handleOpenEditorFromDetail}
                    onDelete={handleDelete}
                    comments={comments}
                    onAddComment={handleAddComment}
                    focusCommentComposer={detailModalFocusComment}
                />
            )}

            {imageViewerOpen && photoItems.length > 0 && (
                <ImageViewer
                    photoItems={photoItems}
                    initialIndex={imageViewerIndex}
                    open={imageViewerOpen}
                    onOpenChange={setImageViewerOpen}
                />
            )}
        </>
    );
}

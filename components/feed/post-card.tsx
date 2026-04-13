"use client";

import {InfiniteData, QueryClient, useQueryClient} from "@tanstack/react-query";
import {
    Bookmark,
    Heart,
    MessageCircle,
    MoreHorizontal,
    Pencil,
    Share2,
    Trash2,
    Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {useCallback, useEffect, useRef, useState} from "react";
import {toast} from "sonner";

import PostPhotoGrid from "@/components/feed/post-photo-grid";
import {PhotoItem} from "@/components/image-viewer";
import PostEditorDialog from "@/components/post-editor-dialog";
import TimeAgo from "@/components/time-ago";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Skeleton} from "@/components/ui/skeleton";
import UserAvatar from "@/components/user-avatar";
import {FeedItemDto} from "@/dto/feed-item-dto";
import {cn} from "@/lib/utils";

const formatCount = (n: number) =>
    n >= 1_000 ? `${(n / 1_000).toFixed(1)}k` : String(n);

const LIKE_COOLDOWN_MS = 400;

type LikeMutationResponse = {
    isSuccess: boolean;
    isLikedByMe: boolean;
    likeCount: number;
    mutationUuid: string;
};

type FeedPage = {
    feedPosts: FeedItemDto[];
    hasMore: boolean;
    nextCursor: unknown;
};

const updateLikeStateInFeedCache = (
    queryClient: QueryClient,
    postUuid: string,
    nextLikedByMe: boolean,
    nextLikeCount: number
) => {
    queryClient.setQueriesData<InfiniteData<FeedPage>>(
        {queryKey: ["feed"]},
        (currentData) => {
            if (!currentData) {
                return currentData;
            }

            return {
                ...currentData,
                pages: currentData.pages.map((page) => ({
                    ...page,
                    feedPosts: page.feedPosts.map((item) =>
                        item.post.postUuid === postUuid
                            ? {...item, likedByMe: nextLikedByMe, likeCount: nextLikeCount}
                            : item
                    ),
                })),
            };
        }
    );
};

const requestLikeMutation = async (
    postUuid: string,
    shouldLike: boolean,
    mutationUuid: string
): Promise<LikeMutationResponse> => {
    const response = await fetch("/api/post/like", {
        method: shouldLike ? "PUT" : "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({postUuid, mutationUuid}),
    });

    const data = await response.json().catch(() => null) as LikeMutationResponse | { error?: string } | null;
    if (!response.ok) {
        throw new Error(data && "error" in data && data.error ? data.error : "Failed to update like.");
    }

    if (!data || !("mutationUuid" in data)) {
        throw new Error("Invalid like response.");
    }

    return data;
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
            toast.error("게시글 삭제에 실패했습니다.");
            return false;
        }

        toast.success("게시글을 삭제했습니다.");
        return true;
    } catch {
        toast.error("삭제 중 오류가 발생했습니다.");
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
            className={cn(
                "rounded-2xl overflow-hidden",
                "bg-card text-card-foreground",
                "border border-border",
                "shadow-sm"
            )}
        >
            {showGroupHeader && (
                <div
                    className={cn(
                        "flex items-center gap-2 px-4 py-2",
                        "border-b border-border/60",
                        "bg-muted/40"
                    )}
                >
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

export default function PostCard({
    feedItem,
    onClickPhotoAction,
    groupName,
    groupUuid,
    groupPic,
    isAllFeed = false,
}: {
    feedItem: FeedItemDto;
    onClickPhotoAction: (photos: PhotoItem[], idx: number) => void;
    groupName?: string;
    groupUuid?: string;
    groupPic?: string | null;
    isAllFeed?: boolean;
}) {
    const post = feedItem.post;
    const queryClient = useQueryClient();

    const [liked, setLiked] = useState(feedItem.likedByMe);
    const [likeCount, setLikeCount] = useState(feedItem.likeCount);
    const [bookmarked, setBookmarked] = useState(false);
    const [heartPop, setHeartPop] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editDialogKey, setEditDialogKey] = useState(0);
    const [updatedContent, setUpdatedContent] = useState<string | null>(null);
    const [likeCooldownUntil, setLikeCooldownUntil] = useState(0);
    const [isLikeCoolingDown, setIsLikeCoolingDown] = useState(false);
    const latestLikeMutationUuidRef = useRef<string | null>(null);
    const committedLikeStateRef = useRef({
        likedByMe: feedItem.likedByMe,
        likeCount: feedItem.likeCount,
    });

    const postContent = updatedContent ?? post.content ?? "";

    useEffect(() => {
        if (likeCooldownUntil <= 0) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setLikeCooldownUntil(0);
            setIsLikeCoolingDown(false);
        }, Math.max(0, likeCooldownUntil - Date.now()));

        return () => window.clearTimeout(timeoutId);
    }, [likeCooldownUntil]);

    const handleLike = useCallback(() => {
        if (isLikeCoolingDown) {
            return;
        }

        const nextLiked = !liked;
        const nextLikeCount = Math.max(0, likeCount + (nextLiked ? 1 : -1));
        const mutationUuid = crypto.randomUUID();

        latestLikeMutationUuidRef.current = mutationUuid;
        setLikeCooldownUntil(Date.now() + LIKE_COOLDOWN_MS);
        setIsLikeCoolingDown(true);
        setHeartPop(true);
        setLiked(nextLiked);
        setLikeCount(nextLikeCount);
        updateLikeStateInFeedCache(queryClient, post.postUuid, nextLiked, nextLikeCount);

        window.setTimeout(() => setHeartPop(false), 350);

        requestLikeMutation(post.postUuid, nextLiked, mutationUuid)
            .then((response) => {
                if (latestLikeMutationUuidRef.current !== response.mutationUuid) {
                    return;
                }

                latestLikeMutationUuidRef.current = null;
                committedLikeStateRef.current = {
                    likedByMe: response.isLikedByMe,
                    likeCount: response.likeCount,
                };
                setLiked(response.isLikedByMe);
                setLikeCount(response.likeCount);
                updateLikeStateInFeedCache(
                    queryClient,
                    post.postUuid,
                    response.isLikedByMe,
                    response.likeCount
                );
            })
            .catch((error: unknown) => {
                if (latestLikeMutationUuidRef.current !== mutationUuid) {
                    return;
                }

                latestLikeMutationUuidRef.current = null;
                const rollbackState = committedLikeStateRef.current;
                setLiked(rollbackState.likedByMe);
                setLikeCount(rollbackState.likeCount);
                updateLikeStateInFeedCache(
                    queryClient,
                    post.postUuid,
                    rollbackState.likedByMe,
                    rollbackState.likeCount
                );
                toast.error(error instanceof Error ? error.message : "Failed to update like.");
            });
    }, [isLikeCoolingDown, likeCount, liked, post.postUuid, queryClient]);

    const handleDelete = useCallback(async () => {
        if (!confirm("이 게시글을 삭제할까요?")) {
            return;
        }

        const success = await requestDeletePost(post.postUuid);
        if (success) {
            setIsDeleted(true);
            await queryClient.invalidateQueries({queryKey: ["feed"]});
        }
    }, [post.postUuid, queryClient]);

    const handleOpenEditor = useCallback(() => {
        setEditDialogKey((prev) => prev + 1);
        setEditDialogOpen(true);
    }, []);

    if (isDeleted) return null;

    return (
        <>
            <article
                className={cn(
                    "rounded-2xl overflow-hidden",
                    "bg-card text-card-foreground",
                    "border border-border",
                    "shadow-sm hover:shadow-md",
                    "transition-shadow duration-200"
                )}
            >
                {(groupName || isAllFeed) && (
                    groupName ? (
                        <Link
                            href={`/group/${groupUuid}`}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2",
                                "border-b border-border/60",
                                "bg-muted/40 transition-colors hover:bg-muted/60",
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
                                className="text-sm text-muted-foreground tracking-wide"
                                style={{position: "relative", top: "-1px"}}
                            >
                                {groupName}
                            </div>
                        </Link>
                    ) : (
                        <div
                            className={cn(
                                "flex items-center gap-2 px-4 py-2",
                                "border-b border-border/60",
                                "bg-muted/40"
                            )}
                        >
                            <Skeleton className="h-6 w-6 rounded-full shrink-0"/>
                            <Skeleton className="h-3 w-20"/>
                        </div>
                    )
                )}

                <div className="flex items-center justify-between px-4 pt-3 pb-3">
                    <div className="flex flex-row items-center gap-2.5">
                        <UserAvatar userUuid={post.userUuid}/>
                        <div className="text-muted-foreground">|</div>
                        <div>
                            <TimeAgo date={post.createdAt} className="text-sm text-muted-foreground"/>
                        </div>
                    </div>
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                            <button
                                className={cn(
                                    "p-1.5 rounded-full transition-colors duration-150",
                                    "text-muted-foreground hover:text-foreground",
                                    "hover:bg-accent focus:outline-none"
                                )}
                            >
                                <MoreHorizontal className="h-4 w-4"/>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32">
                            <DropdownMenuItem onClick={handleOpenEditor} className="cursor-pointer">
                                <Pencil className="mr-2 h-4 w-4"/>
                                <span>수정</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={handleDelete}
                                className="cursor-pointer text-destructive focus:text-destructive"
                            >
                                <Trash2 className="mr-2 h-4 w-4"/>
                                <span>삭제</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {postContent.trim().length > 0 && (
                    <p
                        className={cn(
                            "px-4 pb-3 text-[14px] leading-[1.7] tracking-[-0.005em]",
                            "text-foreground/80"
                        )}
                    >
                        {postContent}
                    </p>
                )}

                <div className="m-1 overflow-hidden rounded-xl">
                    <PostPhotoGrid feedItem={feedItem} onClickPhotoAction={onClickPhotoAction}/>
                </div>

                <div className="flex items-center justify-between px-3 py-2">
                    <div className="flex items-center">
                        <button
                            onClick={handleLike}
                            disabled={isLikeCoolingDown}
                            className={cn(
                                "flex items-center gap-1.5 rounded-xl px-2.5 py-2",
                                "transition-all duration-150 active:scale-90",
                                "disabled:opacity-60 disabled:active:scale-100",
                                liked
                                    ? "text-destructive hover:bg-destructive/10"
                                    : "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            )}
                        >
                            <Heart
                                className={cn(
                                    "h-4.5 w-4.5 transition-all duration-300",
                                    liked && "fill-current",
                                    heartPop && "scale-[1.35]"
                                )}
                            />
                            <span className="text-xs font-medium tabular-nums">{formatCount(likeCount)}</span>
                        </button>

                        <button
                            className={cn(
                                "flex items-center gap-1.5 rounded-xl px-2.5 py-2",
                                "text-muted-foreground hover:bg-accent hover:text-foreground",
                                "transition-all duration-150 active:scale-90"
                            )}
                        >
                            <MessageCircle className="h-4.5 w-4.5"/>
                            <span className="text-xs font-medium tabular-nums">{formatCount(12345)}</span>
                        </button>

                        <button
                            className={cn(
                                "flex items-center rounded-xl px-2.5 py-2",
                                "text-muted-foreground hover:bg-accent hover:text-foreground",
                                "transition-all duration-150 active:scale-90"
                            )}
                        >
                            <Share2 className="h-4.5 w-4.5"/>
                        </button>
                    </div>

                    <button
                        onClick={() => setBookmarked((prev) => !prev)}
                        className={cn(
                            "flex items-center rounded-xl px-2.5 py-2",
                            "transition-all duration-150 active:scale-90",
                            bookmarked
                                ? "text-blue-500 dark:text-blue-400 hover:bg-blue-500/10"
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
        </>
    );
}

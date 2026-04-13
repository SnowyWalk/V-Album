"use client";

import {InfiniteData, QueryClient, useQueryClient} from "@tanstack/react-query";
import {Heart} from "lucide-react";
import {useCallback, useEffect, useRef, useState} from "react";
import {toast} from "sonner";

import {FeedItemDto} from "@/dto/feed-item-dto";
import {cn, formatCount} from "@/lib/utils";

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

type LikeButtonProps = {
    postUuid: string;
    initialLiked: boolean;
    initialLikeCount: number;
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

export default function LikeButton({
    postUuid,
    initialLiked,
    initialLikeCount,
}: LikeButtonProps) {
    const queryClient = useQueryClient();
    const [liked, setLiked] = useState(initialLiked);
    const [likeCount, setLikeCount] = useState(initialLikeCount);
    const [heartPop, setHeartPop] = useState(false);
    const [likeCooldownUntil, setLikeCooldownUntil] = useState(0);
    const [isLikeCoolingDown, setIsLikeCoolingDown] = useState(false);
    const latestLikeMutationUuidRef = useRef<string | null>(null);
    const committedLikeStateRef = useRef({
        likedByMe: initialLiked,
        likeCount: initialLikeCount,
    });

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
        updateLikeStateInFeedCache(queryClient, postUuid, nextLiked, nextLikeCount);

        window.setTimeout(() => setHeartPop(false), 350);

        requestLikeMutation(postUuid, nextLiked, mutationUuid)
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
                    postUuid,
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
                    postUuid,
                    rollbackState.likedByMe,
                    rollbackState.likeCount
                );
                toast.error(error instanceof Error ? error.message : "Failed to update like.");
            });
    }, [isLikeCoolingDown, likeCount, liked, postUuid, queryClient]);

    return (
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
    );
}

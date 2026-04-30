"use client";

import {InfiniteData, useQueryClient} from "@tanstack/react-query";
import {Heart} from "lucide-react";

import {cn, formatCount} from "@/lib/utils";
import {browserApiClient} from "@/lib/api/browser-api-client";
import {useRef, useState} from "react";
import {FeedResponse} from "@/lib/api/schema-alias";


type LikeButtonProps = {
    postUuid: string;
    initialLiked: boolean;
    initialLikeCount: number;
};

export default function LikeButton({postUuid, initialLiked, initialLikeCount}: LikeButtonProps) {
    const queryClient = useQueryClient();
    const [liked, setLiked] = useState(initialLiked);
    const [likeCount, setLikeCount] = useState(initialLikeCount);
    const [mutationUuid, setMutationUuid] = useState<string | null>(null);
    const [isCoolingDown, setIsCoolingDown] = useState(false);
    const cooldownTimeoutRef = useRef<NodeJS.Timeout | null>(null);


    const requestPutLikeMutation = browserApiClient.useMutation("put", "/api/post/like", {
        onMutate: (req) => UpdateLocalLikeState(true, likeCount + 1, req!.body!.mutationUuid),
        onSuccess: (data) => UpdateGlobalLikeState(data.isLikedByMe, data.likeCount, data.mutationUuid)
    });

    const requestDeleteLikeMutation = browserApiClient.useMutation("delete", "/api/post/like", {
        onMutate: (req) => UpdateLocalLikeState(false, likeCount - 1, req!.body!.mutationUuid),
        onSuccess: (data) => UpdateGlobalLikeState(data.isLikedByMe, data.likeCount, data.mutationUuid)
    });

    function UpdateLocalLikeState(liked: boolean, likeCount: number, mutationUuid: string | null) {
        setLiked(liked);
        setLikeCount(likeCount);
        setMutationUuid(mutationUuid);

        setIsCoolingDown(true);
        cooldownTimeoutRef.current = setTimeout(() => setIsCoolingDown(false), 300);
    }
    
    function UpdateGlobalLikeState(liked: boolean, likeCount: number, receivedMutationUuid: string) {
        if (receivedMutationUuid != mutationUuid)
            return;

        setLiked(liked);
        setLikeCount(likeCount);
        queryClient.setQueriesData<InfiniteData<FeedResponse>>(
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
                                ? {...item, likedByMe: liked, likeCount: likeCount}
                                : item
                        ),
                    })),
                };
            }
        );
    }

    return (
        <button
            onClick={() => (!liked ? requestPutLikeMutation : requestDeleteLikeMutation).mutate({
                body: {
                    mutationUuid: crypto.randomUUID(),
                    postUuid: postUuid
                }
            })}
            disabled={isCoolingDown}
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
                    "h-4.5 w-4.5 transition-all duration-300 ease-out",
                    liked && "fill-current",
                )}
            />
            <span className="text-xs font-medium tabular-nums">{formatCount(likeCount)}</span>
        </button>
    );
}
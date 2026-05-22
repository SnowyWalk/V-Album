"use client";

import {useEffect, useRef} from "react";
import {InfiniteData, QueryFunctionContext, useInfiniteQuery} from "@tanstack/react-query";

import PostCard, {PostCardSkeleton} from "@/components/feed/post-card";
import {useMyGroups} from "@/hooks/use-my-groups";
import {browserFetchClient} from "@/lib/api/browser-api-client";
import {FeedResponse} from "@/lib/api/schema-alias";

type PageParam = {
    dateTime: string;
    postUuid: string;
} | null;

type FeedType = "group" | "all";

type FeedQueryKey = ["feed", FeedType, string | undefined];

const FEED_PAGE_LIMIT = 5;

interface FeedListProps {
    type: FeedType;
    groupUuid?: string;
}

export default function FeedList({type, groupUuid}: FeedListProps) {
    const loaderRef = useRef<HTMLDivElement | null>(null);
    const {data: myGroups} = useMyGroups();

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
    } = useInfiniteQuery<FeedResponse, Error, InfiniteData<FeedResponse>, FeedQueryKey, PageParam>({
        queryKey: ["feed", type, groupUuid],
        queryFn: fetchFeed,
        getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : undefined,
        initialPageParam: null
    });

    const posts = data?.pages.flatMap((page) => page.feedPosts) ?? [];
    const shouldShowSkeletons = isLoading || isFetchingNextPage;
    const hasNextPageRef = useRef(hasNextPage);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPageRef.current) {
                    fetchNextPage();
                }
            },
            {rootMargin: "300px"}
        );

        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }

        return () => observer.disconnect();
    }, [fetchNextPage]);

    return (
        <div className="flex flex-col gap-6">
            {posts.map(({post, photos, likedByMe, likeCount}) => {
                const group = type === "all"
                    ? myGroups?.find((item) => item.groupUuid === post.groupUuid)
                    : null;

                return (
                    <PostCard
                        key={post.postUuid}
                        feedItem={{post, photos, likedByMe, likeCount}}
                        groupName={group?.name}
                        groupUuid={group?.groupUuid}
                        groupPic={group?.pic}
                        isAllFeed={type === "all"}
                    />
                );
            })}

            {shouldShowSkeletons && Array.from({length: FEED_PAGE_LIMIT}, (_, index) => (
                <PostCardSkeleton
                    key={`feed-skeleton-${index}`}
                    index={index}
                    showGroupHeader={type === "all"}
                />
            ))}

            <div ref={loaderRef} className="h-px"/>

            {!isLoading && !hasNextPage && posts.length > 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground">
                    <div className="mb-2 text-border">........</div>
                    <div>마지막 게시물입니다.</div>
                </div>
            )}

            {!isLoading && posts.length === 0 && (
                <div className="flex flex-col items-center gap-2 py-20 text-muted-foreground">
                    <p>아직 게시물이 없습니다.</p>
                    <p className="text-xs">
                        {type === "all"
                            ? "가입한 그룹에서 사진과 추억을 공유해보세요!"
                            : "첫 번째 사진을 공유해보세요!"}
                    </p>
                </div>
            )}
        </div>
    );
}

async function fetchFeed({pageParam, queryKey}: QueryFunctionContext<FeedQueryKey, PageParam>): Promise<FeedResponse> {
    const [, type, groupUuid] = queryKey;

    if (type === "all") {
        const {data, error} = await browserFetchClient.GET("/api/group/feed/all", {
            params: {
                query: {
                    Limit: FEED_PAGE_LIMIT,
                    CursorDateTime: pageParam?.dateTime ?? undefined,
                    CursorPostUuid: pageParam?.postUuid ?? undefined,
                }
            }
        })

        if (error) {
            throw new Error(`${type} feed fetch failed: ${error}`);
        }
        return data as FeedResponse;
    }
    else
    {
        const {data, error} = await browserFetchClient.GET("/api/group/feed", {
            params: {
                query: {
                    GroupUuid: groupUuid,
                    Limit: FEED_PAGE_LIMIT,
                    CursorDateTime: pageParam?.dateTime ?? undefined,
                    CursorPostUuid: pageParam?.postUuid ?? undefined,
                }
            }
        })

        if (error) {
            throw new Error(`${type} feed fetch failed: ${error}`);
        }
        return data as FeedResponse;
    }
}
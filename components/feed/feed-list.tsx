"use client";

import {useEffect, useRef} from "react";
import {InfiniteData, QueryFunctionContext, useInfiniteQuery} from "@tanstack/react-query";

import PostCard, {PostCardSkeleton} from "@/components/feed/post-card";
import {FeedItemDto} from "@/dto/feed-item-dto";
import {useMyGroups} from "@/hooks/use-my-groups";

type PageParam = {
    dateTime: string;
    postUuid: string;
} | null;

type FeedResponse = {
    feedPosts: FeedItemDto[];
    hasMore: boolean;
    nextCursor: PageParam | null;
};

type FeedType = "group" | "all";

type FeedQueryKey = ["feed", FeedType, string | undefined];

const FEED_PAGE_LIMIT = 5;

async function fetchFeed({pageParam, queryKey}: QueryFunctionContext<FeedQueryKey, PageParam>) {
    const [, type, groupUuid] = queryKey;

    let url = type === "all"
        ? `/api/group/feed/all?limit=${FEED_PAGE_LIMIT}`
        : `/api/group/feed?groupUuid=${groupUuid}&limit=${FEED_PAGE_LIMIT}`;

    if (pageParam) {
        url += `&cursorDateTime=${pageParam.dateTime}`;
        url += `&cursorPostUuid=${pageParam.postUuid}`;
    }

    const res = await fetch(url);

    if (!res.ok) {
        throw new Error(`${type} feed fetch failed`);
    }

    return res.json();
}

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
        getNextPageParam: (lastPage) => {
            if (!lastPage.hasMore) return null;
            return lastPage.nextCursor;
        },
        initialPageParam: null,
    });

    const posts = data?.pages.flatMap((page) => page.feedPosts) ?? [];
    const shouldShowSkeletons = isLoading || isFetchingNextPage;

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage) {
                    fetchNextPage();
                }
            },
            {rootMargin: "300px"}
        );

        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }

        return () => observer.disconnect();
    }, [fetchNextPage, hasNextPage]);

    return (
        <div className="flex flex-col gap-6">
            {posts.map(({post, photos, likedByMe, likeCount}) => {
                const group = type === "all"
                    ? myGroups?.groups.find((item) => item.groupUuid === post.groupUuid)
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
                    key={`feed-skeleton-${type}-${posts.length}-${index}`}
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
                            ? "그룹에 가입하고 사진을 공유해보세요!"
                            : "첫 번째 사진을 공유해보세요!"}
                    </p>
                </div>
            )}
        </div>
    );
}

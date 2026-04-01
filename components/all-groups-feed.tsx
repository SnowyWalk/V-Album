"use client"

import {useRef, useEffect} from "react"
import {InfiniteData, QueryFunctionContext, useInfiniteQuery} from "@tanstack/react-query"
import {PostDto} from "@/dto/post-dto";
import {PhotoDto} from "@/dto/photo-dto";
import PostCard from "@/components/post-card";
import {PhotoItem} from "@/components/image-viewer";
import {useMyGroups} from "@/hooks/use-my-groups";
import {Avatar, AvatarImage} from "@/components/ui/avatar";
import {Skeleton} from "@/components/ui/skeleton";

type PageParam = {
    dateTime: string,
    postUuid: string
} | null

type FeedItem = {
    post: PostDto
    photos: PhotoDto[] | null
}

type FeedResponse = {
    feedPosts: FeedItem[]
    hasMore: boolean
    nextCursor: PageParam | null
}

type FeedQueryKey = ["feed", "all"]

async function fetchAllFeed({pageParam}: QueryFunctionContext<FeedQueryKey, PageParam>) {
    let url = `/api/group/feed/all?limit=5`

    if (pageParam) {
        url += `&cursorDateTime=${pageParam.dateTime}`
        url += `&cursorPostUuid=${pageParam.postUuid}`
    }

    const res = await fetch(url)

    if (!res.ok)
        throw new Error("All feed fetch failed")

    return res.json()
}

export default function AllGroupsFeed({onClickPhoto}: {
    onClickPhoto: (photos: PhotoItem[], index: number) => void
}) {
    const loaderRef = useRef<HTMLDivElement | null>(null)
    const {data: myGroups} = useMyGroups()

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading
    } = useInfiniteQuery<FeedResponse, Error, InfiniteData<FeedResponse>, FeedQueryKey, PageParam>({
        queryKey: ["feed", "all"],
        queryFn: fetchAllFeed,
        getNextPageParam: lastPage => {
            if (!lastPage.hasMore) return null
            return lastPage.nextCursor
        },
        initialPageParam: null,
    })

    const posts = data?.pages.flatMap(p => p.feedPosts) ?? []

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasNextPage) {
                    fetchNextPage()
                }
            },
            {rootMargin: "300px"}
        )

        if (loaderRef.current)
            observer.observe(loaderRef.current)

        return () => observer.disconnect()
    }, [fetchNextPage, hasNextPage])

    if (isLoading) {
        return (
            <div className="flex flex-col gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-64 w-full rounded-xl bg-muted animate-pulse" />
                ))}
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            {posts.map(({post, photos}) => {
                const group = myGroups?.groups.find(g => g.groupUuid === post.groupUuid);
                
                return (
                    <div key={post.postUuid} className="flex flex-col gap-2">
                        {/* 그룹 정보 표시 헤더 */}
                        {group && (
                            <div className="flex items-center gap-2 px-4 py-1">
                                <Avatar className="h-5 w-5 rounded-full ring-1 ring-border">
                                    <AvatarImage src={`/group-pics/${group.pic}.png`} />
                                </Avatar>
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    {group.name}
                                </span>
                            </div>
                        )}
                        <PostCard feedItem={{post, photos}} onClickPhoto={onClickPhoto}/>
                    </div>
                )
            })}

            <div ref={loaderRef} className="h-20 flex items-center justify-center">
                {isFetchingNextPage && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        로딩 중...
                    </div>
                )}
                {!hasNextPage && posts.length > 0 && (
                    <span className="text-sm text-muted-foreground">모든 게시물을 확인했습니다.</span>
                )}
                {!isLoading && posts.length === 0 && (
                    <div className="flex flex-col items-center gap-2 py-20 text-muted-foreground">
                        <p>아직 게시물이 없습니다.</p>
                        <p className="text-xs">그룹에 가입하여 사진을 공유해보세요!</p>
                    </div>
                )}
            </div>
        </div>
    )
}

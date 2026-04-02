"use client"

import {useRef, useEffect} from "react"
import {InfiniteData, QueryFunctionContext, useInfiniteQuery} from "@tanstack/react-query"
import {PostDto} from "@/dto/post-dto";
import {PhotoDto} from "@/dto/photo-dto";
import PostCard from "@/components/feed/post-card";
import {PhotoItem} from "@/components/image-viewer";
import {useMyGroups} from "@/hooks/use-my-groups";
import {Loader2} from "lucide-react";

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

export default function AllGroupsFeed({onClickPhotoAction}: {
    onClickPhotoAction: (photos: PhotoItem[], index: number) => void
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

    return (
        <div className="flex flex-col gap-6">
            {posts.map(({post, photos}) => {
                const group = myGroups?.groups.find(g => g.groupUuid === post.groupUuid);
                
                return (
                    <PostCard 
                        key={post.postUuid} 
                        feedItem={{post, photos}} 
                        onClickPhotoAction={onClickPhotoAction}
                        groupName={group?.name}
                        groupPic={group?.pic}
                    />
                )
            })}

            <div ref={loaderRef} className="h-20 flex items-center justify-center">
                {(isFetchingNextPage || isLoading) && (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                )}
                {!hasNextPage && posts.length > 0 && (
                    <div className="text-center text-sm text-muted-foreground py-8">
                        <div className="mb-2 text-border">───────</div>
                        <div>마지막 게시물입니다</div>
                    </div>
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

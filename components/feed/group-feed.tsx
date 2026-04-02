"use client"

import {useRef, useEffect} from "react"
import {InfiniteData, QueryFunctionContext, useInfiniteQuery} from "@tanstack/react-query"
import {PostDto} from "@/dto/post-dto";
import {PhotoDto} from "@/dto/photo-dto";
import PostCard from "@/components/feed/post-card";
import {PhotoItem} from "@/components/image-viewer";
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

type FeedQueryKey = ["feed", string]

async function fetchFeed({pageParam, queryKey}: QueryFunctionContext<FeedQueryKey, PageParam>) {
    let url = `/api/group/feed?limit=2&groupUuid=${queryKey[1]}`

    if (pageParam) {
        url += `&cursorDateTime=${pageParam.dateTime}`
        url += `&cursorPostUuid=${pageParam.postUuid}`
    }

    const res = await fetch(url)

    if (!res.ok)
        throw new Error("Feed fetch failed")

    return res.json()
}

export default function GroupFeed({groupUuid, onClickPhotoAction}: {
    groupUuid: string,
    onClickPhotoAction: (photos: PhotoItem[], idx: number) => void
}) {

    const loaderRef = useRef<HTMLDivElement | null>(null)

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteQuery<FeedResponse, Error, InfiniteData<FeedResponse>, FeedQueryKey, PageParam>({
        queryKey: ["feed", groupUuid],
        queryFn: fetchFeed,
        getNextPageParam: lastPage => {
            if (!lastPage.hasMore) return null
            return lastPage.nextCursor
        },
        initialPageParam: null,
    })

    const posts = data?.pages.flatMap(p => p.feedPosts) ?? []
    console.log(data?.pages.flatMap(e => e))

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

            {posts.map(({post, photos}) => (
                <PostCard key={post.postUuid} feedItem={{post: post, photos: photos}} onClickPhotoAction={onClickPhotoAction}/>
            ))}

            <div ref={loaderRef} className="h-20 flex items-center justify-center">

                {isFetchingNextPage && (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                )}

                {!hasNextPage && posts.length > 0 && (
                    <div className="text-center text-sm text-muted-foreground py-8">
                        <div className="mb-2">───────</div>
                        <div>마지막 게시물입니다</div>
                    </div>
                )}

            </div>

        </div>
    )
}
"use client"

import { useRef, useEffect } from "react"
import {InfiniteData, QueryFunctionContext, QueryKey, useInfiniteQuery} from "@tanstack/react-query"
import {PostDto} from "@/dto/post-dto";
import {PhotoDto} from "@/dto/photo-dto";

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

async function fetchFeed({ pageParam, queryKey }: QueryFunctionContext<FeedQueryKey, PageParam>)  {
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

export default function GroupFeed({groupUuid} : {groupUuid: string}) {

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
    console.log(data?.pages.flatMap(e=>e))

    useEffect(() => {

        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasNextPage) {
                    fetchNextPage()
                }
            },
            { rootMargin: "300px" }
        )

        if (loaderRef.current)
            observer.observe(loaderRef.current)

        return () => observer.disconnect()

    }, [fetchNextPage, hasNextPage])

    return (
        <div className="flex flex-col gap-4">

            {posts.map(({post, photos}) => (
                <div
                    key={post.postUuid}
                    className="border p-4 rounded-xl min-h-[500px] "
                >
                    {post.content}
                    {photos && <div>사진: {photos?.length}개</div>}
                </div>
            ))}

            <div ref={loaderRef} className="h-10 flex items-center justify-center">

                {isFetchingNextPage && (
                    <span>Loading...</span>
                )}

            </div>

        </div>
    )
}
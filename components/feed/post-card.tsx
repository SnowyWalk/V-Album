"use client";

import {Card, CardContent, CardFooter, CardHeader} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Heart, MessageCircle, MoreHorizontal, Share2} from "lucide-react";
import {FeedItemDto} from "@/dto/feed-item-dto";
import UserAvatar from "@/components/user-avatar";
import PostPhotoGrid from "@/components/feed/post-photo-grid";
import {PhotoItem} from "@/components/image-viewer";

export default function PostCard({feedItem, onClickPhotoAction}: {
    feedItem: FeedItemDto,
    onClickPhotoAction: (photos: PhotoItem[], idx: number) => void
}) {
    const post = feedItem.post;

    return (
        <Card key={post.postUuid} className="overflow-hidden border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between p-0 px-2">
                <UserAvatar userUuid={post.userUuid}/>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4"/>
                </Button>
            </CardHeader>
            <CardContent className="p-0">
                <div className="px-4 pb-3">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{post.content}</p>
                </div>
                <PostPhotoGrid feedItem={feedItem} onClickPhotoAction={onClickPhotoAction}/>
                <div className={"text-muted-foreground text-sm"}>{post.postUuid}</div>
            </CardContent>
            <CardFooter className="flex flex-col items-start p-2 px-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" className="h-9 gap-2 px-2 hover:text-red-500">
                        <Heart className="h-5 w-5"/>
                        <span className="text-xs font-medium">{12345}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-9 gap-2 px-2">
                        <MessageCircle className="h-5 w-5"/>
                        <span className="text-xs font-medium">{12345}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-9 px-2">
                        <Share2 className="h-5 w-5"/>
                    </Button>
                </div>
            </CardFooter>
        </Card>

    )

}
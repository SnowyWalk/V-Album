"use client";

import {Heart, MessageCircle, Share2, Bookmark, MoreHorizontal} from "lucide-react";
import {FeedItemDto} from "@/dto/feed-item-dto";
import UserAvatar from "@/components/user-avatar";
import PostPhotoGrid from "@/components/feed/post-photo-grid";
import {PhotoItem} from "@/components/image-viewer";
import {useState, useCallback} from "react";
import {cn} from "@/lib/utils";

const formatCount = (n: number) =>
    n >= 1_000 ? `${(n / 1_000).toFixed(1)}k` : String(n);

export default function PostCard({
                                     feedItem,
                                     onClickPhotoAction,
                                 }: {
    feedItem: FeedItemDto;
    onClickPhotoAction: (photos: PhotoItem[], idx: number) => void;
}) {
    const post = feedItem.post;

    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(12345);
    const [bookmarked, setBookmarked] = useState(false);
    const [heartPop, setHeartPop] = useState(false);

    const handleLike = useCallback(() => {
        setHeartPop(true);
        setLiked(prev => !prev);
        setLikeCount(prev => liked ? prev - 1 : prev + 1);
        setTimeout(() => setHeartPop(false), 350);
    }, [liked]);

    return (
        <article className={cn(
            "rounded-2xl overflow-hidden",
            "bg-card text-card-foreground",
            "border border-border",
            "shadow-sm hover:shadow-md",
            "transition-shadow duration-200"
        )}>

            {/* ── Header ─────────────────────────── */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3">
                <UserAvatar userUuid={post.userUuid}/>
                <button className={cn(
                    "p-1.5 rounded-full transition-colors duration-150",
                    "text-muted-foreground hover:text-foreground",
                    "hover:bg-accent"
                )}>
                    <MoreHorizontal className="h-4 w-4"/>
                </button>
            </div>

            {/* ── Caption ────────────────────────── */}
            {post.content && (
                <p className={cn(
                    "px-4 pb-3 text-[14px] leading-[1.7] tracking-[-0.005em]",
                    "text-foreground/80"
                )}>
                    {post.content}
                </p>
            )}

            {/* ── Photos ─────────────────────────── */}
            <div className="m-1 rounded-xl overflow-hidden">
                <PostPhotoGrid
                    feedItem={feedItem}
                    onClickPhotoAction={onClickPhotoAction}
                />
            </div>

            {/* ── Footer ─────────────────────────── */}
            <div className="flex items-center justify-between px-3 py-2">
                {/* 반응 버튼들 */}
                <div className="flex items-center">
                    {/* 좋아요 */}
                    <button
                        onClick={handleLike}
                        className={cn(
                            "flex items-center gap-1.5 px-2.5 py-2 rounded-xl",
                            "transition-all duration-150 active:scale-90",
                            liked
                                ? "text-destructive hover:bg-destructive/10"
                                : "text-muted-foreground hover:text-destructive hover:bg-destructive/10",
                        )}
                    >
                        <Heart className={cn(
                            "h-[18px] w-[18px] transition-all duration-300",
                            liked && "fill-current",
                            heartPop && "scale-[1.35]"
                        )}/>
                        <span className="text-xs font-medium tabular-nums">
                            {formatCount(likeCount)}
                        </span>
                    </button>

                    {/* 댓글 */}
                    <button className={cn(
                        "flex items-center gap-1.5 px-2.5 py-2 rounded-xl",
                        "text-muted-foreground hover:text-foreground hover:bg-accent",
                        "transition-all duration-150 active:scale-90"
                    )}>
                        <MessageCircle className="h-[18px] w-[18px]"/>
                        <span className="text-xs font-medium tabular-nums">
                            {formatCount(12345)}
                        </span>
                    </button>

                    {/* 공유 */}
                    <button className={cn(
                        "flex items-center px-2.5 py-2 rounded-xl",
                        "text-muted-foreground hover:text-foreground hover:bg-accent",
                        "transition-all duration-150 active:scale-90"
                    )}>
                        <Share2 className="h-[18px] w-[18px]"/>
                    </button>
                </div>

                {/* 북마크 */}
                <button
                    onClick={() => setBookmarked(prev => !prev)}
                    className={cn(
                        "flex items-center px-2.5 py-2 rounded-xl",
                        "transition-all duration-150 active:scale-90",
                        bookmarked
                            ? "text-blue-500 dark:text-blue-400 hover:bg-blue-500/10"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                >
                    <Bookmark className={cn(
                        "h-[18px] w-[18px] transition-all duration-300",
                        bookmarked && "fill-current"
                    )}/>
                </button>
            </div>
        </article>
    );
}
"use client";

import {Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Trash2, Users} from "lucide-react";
import {Skeleton} from "@/components/ui/skeleton";
import Image from "next/image";
import {FeedItemDto} from "@/dto/feed-item-dto";
import UserAvatar from "@/components/user-avatar";
import PostPhotoGrid from "@/components/feed/post-photo-grid";
import {PhotoItem} from "@/components/image-viewer";
import {useState, useCallback} from "react";
import {cn} from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {toast} from "sonner";

const formatCount = (n: number) =>
    n >= 1_000 ? `${(n / 1_000).toFixed(1)}k` : String(n);

const RequestDeletePost = async (postUuid: string): Promise<boolean> => {
    try {
        const result = await fetch("/api/group/delete-post", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                postUuid: postUuid,
            }),
        })

        if (result.status !== 200) {
            toast.error("글 삭제에 실패했습니다.");
            return false
        }

        toast.success("글이 삭제되었습니다.");
        return true
    } catch (error) {
        toast.error("삭제 중 오류가 발생했습니다.");
        return false
    }
}

export default function PostCard({
                                     feedItem,
                                     onClickPhotoAction,
                                     groupName,
                                     groupPic,
                                     isAllFeed = false,
                                 }: {
    feedItem: FeedItemDto;
    onClickPhotoAction: (photos: PhotoItem[], idx: number) => void;
    groupName?: string;
    groupPic?: string | null;
    isAllFeed?: boolean;
}) {
    const post = feedItem.post;

    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(12345);
    const [bookmarked, setBookmarked] = useState(false);
    const [heartPop, setHeartPop] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);

    const handleLike = useCallback(() => {
        setHeartPop(true);
        setLiked(prev => !prev);
        setLikeCount(prev => liked ? prev - 1 : prev + 1);
        setTimeout(() => setHeartPop(false), 350);
    }, [liked]);

    const handleDelete = useCallback(async () => {
        if (confirm("정말로 이 글을 삭제하시겠습니까?")) {
            const success = await RequestDeletePost(post.postUuid);
            if (success) {
                setIsDeleted(true);
            }
        }
    }, [post.postUuid]);

    if (isDeleted) return null;

    return (
        <article className={cn(
            "rounded-2xl overflow-hidden",
            "bg-card text-card-foreground",
            "border border-border",
            "shadow-sm hover:shadow-md",
            "transition-shadow duration-200"
        )}>
            {/* ── Group Strip ────────────────────── */}
            {(groupName || isAllFeed) && (
                <div className={cn(
                    "flex items-center gap-2 px-4 py-2",
                    "border-b border-border/60",
                    "bg-muted/40",
                )}>
                    {groupName ? (
                        <>
                            <div
                                className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full border border-border/60 bg-muted">
                                {groupPic ? (
                                    <Image src={`/group-pics/${groupPic}.png`} alt={groupName} fill
                                           className="object-cover"/>
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                        <Users className="h-3 w-3 text-muted-foreground"/>
                                    </div>
                                )}
                            </div>
                            <div className="text-sm text-muted-foreground tracking-wide" style={{position: 'relative', top: '-1px'}}>
                                    {groupName}
                            </div>
                        </>
                    ) : (
                        <>
                            <Skeleton className="h-6 w-6 rounded-full shrink-0"/>
                            <Skeleton className="h-3 w-20"/>
                        </>
                    )}
                </div>
            )}

            {/* ── Header ─────────────────────────── */}
            <div className="flex items-center justify-between px-4 pt-3 pb-3">
                <div className="flex flex-col gap-1">
                    <UserAvatar userUuid={post.userUuid}/>
                </div>
                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                        <button className={cn(
                            "p-1.5 rounded-full transition-colors duration-150",
                            "text-muted-foreground hover:text-foreground",
                            "hover:bg-accent focus:outline-none"
                        )}>
                            <MoreHorizontal className="h-4 w-4"/>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32">
                        <DropdownMenuItem
                            onClick={handleDelete}
                            className="text-destructive focus:text-destructive cursor-pointer"
                        >
                            <Trash2 className="mr-2 h-4 w-4"/>
                            <span>글 삭제</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
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
                            "h-4.5 w-4.5 transition-all duration-300",
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
                        <MessageCircle className="h-4.5 w-4.5"/>
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
                        <Share2 className="h-4.5 w-4.5"/>
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
                        "h-4.5 w-4.5 transition-all duration-300",
                        bookmarked && "fill-current"
                    )}/>
                </button>
            </div>
        </article>
    );
}
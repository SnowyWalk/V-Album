"use client";

import {useQueryClient} from "@tanstack/react-query";
import {
    Bookmark,
    MessageCircle,
    MoreHorizontal,
    Pencil,
    Share2,
    Trash2,
    Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {useCallback, useState} from "react";
import {toast} from "sonner";

import LikeButton from "@/components/feed/like-button";
import PostPhotoGrid from "@/components/feed/post-photo-grid";
import {PhotoItem} from "@/components/image-viewer";
import PostEditorDialog from "@/components/post-editor-dialog";
import TimeAgo from "@/components/time-ago";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Skeleton} from "@/components/ui/skeleton";
import UserAvatar from "@/components/user-avatar";
import {cn, formatCount} from "@/lib/utils";
import {FeedItemDto} from "@/dto/feed-item-dto";

const requestDeletePost = async (postUuid: string): Promise<boolean> => {
    try {
        const result = await fetch("/api/group/delete-post", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({postUuid}),
        });

        if (!result.ok) {
            toast.error("게시글 삭제에 실패했습니다.");
            return false;
        }

        toast.success("게시글을 삭제했습니다.");
        return true;
    } catch {
        toast.error("삭제 중 오류가 발생했습니다.");
        return false;
    }
};

export function PostCardSkeleton({
    showGroupHeader = false,
    index = 0,
}: {
    showGroupHeader?: boolean;
    index?: number;
}) {
    const contentWidths = [
        ["w-11/12", "w-4/5", "w-2/3"],
        ["w-5/6", "w-3/4", "w-1/2"],
        ["w-10/12", "w-2/3", "w-3/5"],
    ] as const;
    const [firstLine, secondLine, thirdLine] = contentWidths[index % contentWidths.length];

    return (
        <article
            aria-hidden="true"
            className={cn(
                "rounded-2xl overflow-hidden",
                "bg-card text-card-foreground",
                "border border-border",
                "shadow-sm"
            )}
        >
            {showGroupHeader && (
                <div
                    className={cn(
                        "flex items-center gap-2 px-4 py-2",
                        "border-b border-border/60",
                        "bg-muted/40"
                    )}
                >
                    <Skeleton className="h-6 w-6 shrink-0 rounded-full"/>
                    <Skeleton className="h-3 w-24"/>
                </div>
            )}

            <div className="flex items-center justify-between px-4 pb-3 pt-3">
                <div className="flex items-center gap-2.5">
                    <Skeleton className="h-8 w-8 shrink-0 rounded-full"/>
                    <Skeleton className="h-4 w-24"/>
                    <div className="text-muted-foreground">|</div>
                    <Skeleton className="h-4 w-16"/>
                </div>
                <Skeleton className="h-8 w-8 rounded-full"/>
            </div>

            <div className="space-y-2 px-4 pb-3">
                <Skeleton className={`h-4 ${firstLine}`}/>
                <Skeleton className={`h-4 ${secondLine}`}/>
                <Skeleton className={`h-4 ${thirdLine}`}/>
            </div>

            <div className="m-1 overflow-hidden rounded-xl">
                <Skeleton className="aspect-4/3 w-full rounded-none"/>
            </div>

            <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-16 rounded-xl"/>
                    <Skeleton className="h-9 w-16 rounded-xl"/>
                    <Skeleton className="h-9 w-9 rounded-xl"/>
                </div>
                <Skeleton className="h-9 w-9 rounded-xl"/>
            </div>
        </article>
    );
}

export default function PostCard({
    feedItem,
    onClickPhotoAction,
    groupName,
    groupUuid,
    groupPic,
    isAllFeed = false,
}: {
    feedItem: FeedItemDto;
    onClickPhotoAction: (photos: PhotoItem[], idx: number) => void;
    groupName?: string;
    groupUuid?: string;
    groupPic?: string | null;
    isAllFeed?: boolean;
}) {
    const post = feedItem.post;
    const queryClient = useQueryClient();

    const [bookmarked, setBookmarked] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editDialogKey, setEditDialogKey] = useState(0);
    const [updatedContent, setUpdatedContent] = useState<string | null>(null);

    const postContent = updatedContent ?? post.content ?? "";

    const handleDelete = useCallback(async () => {
        if (!confirm("이 게시글을 삭제할까요?")) {
            return;
        }

        const success = await requestDeletePost(post.postUuid);
        if (success) {
            setIsDeleted(true);
            await queryClient.invalidateQueries({queryKey: ["feed"]});
        }
    }, [post.postUuid, queryClient]);

    const handleOpenEditor = useCallback(() => {
        setEditDialogKey((prev) => prev + 1);
        setEditDialogOpen(true);
    }, []);

    if (isDeleted) return null;

    return (
        <>
            <article
                className={cn(
                    "rounded-2xl overflow-hidden",
                    "bg-card text-card-foreground",
                    "border border-border",
                    "shadow-sm hover:shadow-md",
                    "transition-shadow duration-200"
                )}
            >
                {(groupName || isAllFeed) && (
                    groupName ? (
                        <Link
                            href={`/group/${groupUuid}`}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2",
                                "border-b border-border/60",
                                "bg-muted/40 transition-colors hover:bg-muted/60",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            )}
                        >
                            <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full border border-border/60 bg-muted">
                                {groupPic ? (
                                    <Image
                                        src={`/group-pics/${groupPic}.png`}
                                        alt={groupName}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                        <Users className="h-3 w-3 text-muted-foreground"/>
                                    </div>
                                )}
                            </div>
                            <div
                                className="text-sm text-muted-foreground tracking-wide"
                                style={{position: "relative", top: "-1px"}}
                            >
                                {groupName}
                            </div>
                        </Link>
                    ) : (
                        <div
                            className={cn(
                                "flex items-center gap-2 px-4 py-2",
                                "border-b border-border/60",
                                "bg-muted/40"
                            )}
                        >
                            <Skeleton className="h-6 w-6 rounded-full shrink-0"/>
                            <Skeleton className="h-3 w-20"/>
                        </div>
                    )
                )}

                <div className="flex items-center justify-between px-4 pt-3 pb-3">
                    <div className="flex flex-row items-center gap-2.5">
                        <UserAvatar userUuid={post.userUuid}/>
                        <div className="text-muted-foreground">|</div>
                        <div>
                            <TimeAgo date={post.createdAt} className="text-sm text-muted-foreground"/>
                        </div>
                    </div>
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                            <button
                                className={cn(
                                    "p-1.5 rounded-full transition-colors duration-150",
                                    "text-muted-foreground hover:text-foreground",
                                    "hover:bg-accent focus:outline-none"
                                )}
                            >
                                <MoreHorizontal className="h-4 w-4"/>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32">
                            <DropdownMenuItem onClick={handleOpenEditor} className="cursor-pointer">
                                <Pencil className="mr-2 h-4 w-4"/>
                                <span>수정</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={handleDelete}
                                className="cursor-pointer text-destructive focus:text-destructive"
                            >
                                <Trash2 className="mr-2 h-4 w-4"/>
                                <span>삭제</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {postContent.trim().length > 0 && (
                    <p
                        className={cn(
                            "px-4 pb-3 text-[14px] leading-[1.7] tracking-[-0.005em]",
                            "text-foreground/80"
                        )}
                    >
                        {postContent}
                    </p>
                )}

                <div className="m-1 overflow-hidden rounded-xl">
                    <PostPhotoGrid feedItem={feedItem} onClickPhotoAction={onClickPhotoAction}/>
                </div>

                <div className="flex items-center justify-between px-3 py-2">
                    <div className="flex items-center">
                        <LikeButton
                            postUuid={post.postUuid}
                            initialLiked={feedItem.likedByMe}
                            initialLikeCount={feedItem.likeCount}
                        />

                        <button
                            className={cn(
                                "flex items-center gap-1.5 rounded-xl px-2.5 py-2",
                                "text-muted-foreground hover:bg-accent hover:text-foreground",
                                "transition-all duration-150 active:scale-90"
                            )}
                        >
                            <MessageCircle className="h-4.5 w-4.5"/>
                            <span className="text-xs font-medium tabular-nums">{formatCount(12345)}</span>
                        </button>

                        <button
                            className={cn(
                                "flex items-center rounded-xl px-2.5 py-2",
                                "text-muted-foreground hover:bg-accent hover:text-foreground",
                                "transition-all duration-150 active:scale-90"
                            )}
                        >
                            <Share2 className="h-4.5 w-4.5"/>
                        </button>
                    </div>

                    <button
                        onClick={() => setBookmarked((prev) => !prev)}
                        className={cn(
                            "flex items-center rounded-xl px-2.5 py-2",
                            "transition-all duration-150 active:scale-90",
                            bookmarked
                                ? "text-blue-500 dark:text-blue-400 hover:bg-blue-500/10"
                                : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        )}
                    >
                        <Bookmark
                            className={cn(
                                "h-4.5 w-4.5 transition-all duration-300",
                                bookmarked && "fill-current"
                            )}
                        />
                    </button>
                </div>
            </article>

            {editDialogOpen && (
                <PostEditorDialog
                    key={editDialogKey}
                    open={editDialogOpen}
                    onOpenChange={setEditDialogOpen}
                    mode="edit"
                    groupUuid={post.groupUuid}
                    postUuid={post.postUuid}
                    initialContent={postContent}
                    initialPhotos={feedItem.photos}
                    onSubmitted={({content}) => {
                        setUpdatedContent(content);
                    }}
                />
            )}
        </>
    );
}

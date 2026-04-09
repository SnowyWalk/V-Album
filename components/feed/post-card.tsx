"use client";

import {useQueryClient} from "@tanstack/react-query";
import {
    Bookmark,
    Heart,
    Loader2,
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

import PostPhotoGrid from "@/components/feed/post-photo-grid";
import {PhotoItem} from "@/components/image-viewer";
import TimeAgo from "@/components/time-ago";
import {Button} from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Skeleton} from "@/components/ui/skeleton";
import {Textarea} from "@/components/ui/textarea";
import UserAvatar from "@/components/user-avatar";
import {FeedItemDto} from "@/dto/feed-item-dto";
import {cn} from "@/lib/utils";

const formatCount = (n: number) =>
    n >= 1_000 ? `${(n / 1_000).toFixed(1)}k` : String(n);

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
            toast.error("Failed to delete post.");
            return false;
        }

        toast.success("Post deleted.");
        return true;
    } catch {
        toast.error("Delete failed.");
        return false;
    }
};

const requestUpdatePost = async (postUuid: string, content: string): Promise<boolean> => {
    try {
        const result = await fetch("/api/group/update-post", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({postUuid, content}),
        });

        if (!result.ok) {
            const errorData = await result.json().catch(() => ({}));
            toast.error(errorData.error || "Failed to update post.");
            return false;
        }

        toast.success("Post updated.");
        return true;
    } catch {
        toast.error("Update failed.");
        return false;
    }
};

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

    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(12345);
    const [bookmarked, setBookmarked] = useState(false);
    const [heartPop, setHeartPop] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [updatedContent, setUpdatedContent] = useState<string | null>(null);
    const [draftContent, setDraftContent] = useState("");
    const postContent = updatedContent ?? post.content ?? "";

    const handleLike = useCallback(() => {
        setHeartPop(true);
        setLiked((prev) => !prev);
        setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
        setTimeout(() => setHeartPop(false), 350);
    }, [liked]);

    const handleDelete = useCallback(async () => {
        if (!confirm("Delete this post?")) {
            return;
        }

        const success = await requestDeletePost(post.postUuid);
        if (success) {
            setIsDeleted(true);
            await queryClient.invalidateQueries({queryKey: ["feed"]});
        }
    }, [post.postUuid, queryClient]);

    const handleEditStart = useCallback(() => {
        setDraftContent(postContent);
        setIsEditing(true);
    }, [postContent]);

    const handleEditCancel = useCallback(() => {
        setDraftContent(postContent);
        setIsEditing(false);
    }, [postContent]);

    const handleEditSave = useCallback(async () => {
        if (isSaving) {
            return;
        }

        const hasPhotos = (feedItem.photos?.length ?? 0) > 0;
        if (!hasPhotos && draftContent.trim().length === 0) {
            toast.error("Posts without photos need text.");
            return;
        }

        setIsSaving(true);
        const success = await requestUpdatePost(post.postUuid, draftContent);
        if (success) {
            setUpdatedContent(draftContent);
            setIsEditing(false);
            await queryClient.invalidateQueries({queryKey: ["feed"]});
        }
        setIsSaving(false);
    }, [draftContent, feedItem.photos, isSaving, post.postUuid, queryClient]);

    if (isDeleted) return null;

    return (
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
                <div className="flex flex-row gap-2.5 items-center">
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
                        <DropdownMenuItem onClick={handleEditStart} className="cursor-pointer">
                            <Pencil className="mr-2 h-4 w-4"/>
                            <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={handleDelete}
                            className="text-destructive focus:text-destructive cursor-pointer"
                        >
                            <Trash2 className="mr-2 h-4 w-4"/>
                            <span>Delete</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {isEditing ? (
                <div className="px-4 pb-3">
                    <Textarea
                        value={draftContent}
                        onChange={(e) => setDraftContent(e.target.value)}
                        className="min-h-[120px] resize-none"
                        placeholder="Write something..."
                        disabled={isSaving}
                    />
                    <div className="mt-3 flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={handleEditCancel} disabled={isSaving}>
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleEditSave}
                            disabled={isSaving || draftContent === postContent}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                    Saving
                                </>
                            ) : (
                                "Save"
                            )}
                        </Button>
                    </div>
                </div>
            ) : postContent.trim().length > 0 ? (
                <p
                    className={cn(
                        "px-4 pb-3 text-[14px] leading-[1.7] tracking-[-0.005em]",
                        "text-foreground/80"
                    )}
                >
                    {postContent}
                </p>
            ) : null}

            <div className="m-1 rounded-xl overflow-hidden">
                <PostPhotoGrid feedItem={feedItem} onClickPhotoAction={onClickPhotoAction}/>
            </div>

            <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center">
                    <button
                        onClick={handleLike}
                        className={cn(
                            "flex items-center gap-1.5 px-2.5 py-2 rounded-xl",
                            "transition-all duration-150 active:scale-90",
                            liked
                                ? "text-destructive hover:bg-destructive/10"
                                : "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        )}
                    >
                        <Heart
                            className={cn(
                                "h-4.5 w-4.5 transition-all duration-300",
                                liked && "fill-current",
                                heartPop && "scale-[1.35]"
                            )}
                        />
                        <span className="text-xs font-medium tabular-nums">{formatCount(likeCount)}</span>
                    </button>

                    <button
                        className={cn(
                            "flex items-center gap-1.5 px-2.5 py-2 rounded-xl",
                            "text-muted-foreground hover:text-foreground hover:bg-accent",
                            "transition-all duration-150 active:scale-90"
                        )}
                    >
                        <MessageCircle className="h-4.5 w-4.5"/>
                        <span className="text-xs font-medium tabular-nums">{formatCount(12345)}</span>
                    </button>

                    <button
                        className={cn(
                            "flex items-center px-2.5 py-2 rounded-xl",
                            "text-muted-foreground hover:text-foreground hover:bg-accent",
                            "transition-all duration-150 active:scale-90"
                        )}
                    >
                        <Share2 className="h-4.5 w-4.5"/>
                    </button>
                </div>

                <button
                    onClick={() => setBookmarked((prev) => !prev)}
                    className={cn(
                        "flex items-center px-2.5 py-2 rounded-xl",
                        "transition-all duration-150 active:scale-90",
                        bookmarked
                            ? "text-blue-500 dark:text-blue-400 hover:bg-blue-500/10"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
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
    );
}

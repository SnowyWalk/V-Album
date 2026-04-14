"use client";

import {MoreHorizontal, Pencil, Trash2} from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {cn} from "@/lib/utils";

type PostControlMenuProps = {
    onEdit: () => void;
    onDelete: () => void;
    triggerClassName?: string;
    contentClassName?: string;
};

export default function PostControlMenu({
    onEdit,
    onDelete,
    triggerClassName,
    contentClassName,
}: PostControlMenuProps) {
    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    aria-label="게시물 메뉴 열기"
                    className={cn(
                        "rounded-full p-1.5 text-muted-foreground transition-colors duration-150",
                        "hover:bg-accent hover:text-foreground focus:outline-none",
                        triggerClassName
                    )}
                >
                    <MoreHorizontal className="h-4 w-4"/>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className={cn("z-[80] w-32", contentClassName)}
            >
                <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
                    <Pencil className="mr-2 h-4 w-4"/>
                    <span>수정</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={onDelete}
                    className="cursor-pointer text-destructive focus:text-destructive"
                >
                    <Trash2 className="mr-2 h-4 w-4"/>
                    <span>삭제</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

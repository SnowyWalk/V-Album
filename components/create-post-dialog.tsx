"use client";

import {Plus} from "lucide-react";
import {useState} from "react";

import PostEditorDialog from "@/components/post-editor-dialog";
import {Button} from "@/components/ui/button";

export function CreatePostDialog({groupUuid}: { groupUuid: string }) {
    const [open, setOpen] = useState(false);
    const [editorKey, setEditorKey] = useState(0);

    const handleOpen = () => {
        setEditorKey((prev) => prev + 1);
        setOpen(true);
    };

    return (
        <>
            <Button
                type="button"
                onClick={handleOpen}
                className="fixed bottom-8 right-8 z-40 h-14 w-14 rounded-full shadow-lg transition-none! duration-0! active:scale-95"
            >
                <Plus className="h-8 w-8"/>
            </Button>
            {open && (
                <PostEditorDialog
                    key={editorKey}
                    open={open}
                    onOpenChange={setOpen}
                    mode="create"
                    groupUuid={groupUuid}
                />
            )}
        </>
    );
}

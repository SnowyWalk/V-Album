"use client";

import {use} from "react";

import FeedList from "@/components/feed/feed-list";
import {CreatePostDialog} from "@/components/create-post-dialog";

interface PageProps {
    params: Promise<{
        groupUuid: string;
    }>;
}

export default function GroupFeedPage({params}: PageProps) {
    const {groupUuid} = use(params);

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <header className="sticky top-0 z-10 bg-background/80 py-4 backdrop-blur-md">
                <h1 className="text-2xl font-bold">그룹 피드</h1>
                <p className="text-sm text-muted-foreground">ID: {groupUuid}</p>
            </header>

            <FeedList type="group" groupUuid={groupUuid}/>

            <CreatePostDialog groupUuid={groupUuid}/>
        </div>
    );
}

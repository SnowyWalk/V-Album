"use client";

import {use} from "react";
import {CreatePostDialog} from "@/components/create-post-dialog";
import {ImageViewer, PhotoItem} from "@/components/image-viewer";
import {useState} from "react";
import FeedList from "@/components/feed/feed-list";

interface PageProps {
    params: Promise<{
        groupUuid: string;
    }>;
}

export default function GroupFeedPage({params}: PageProps) {
    const {groupUuid} = use(params);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [selectedPhotos, setSelectedPhotos] = useState<PhotoItem[]>([]);
    const [initialIndex, setInitialIndex] = useState(0);

    const handleImageClick = (photos: PhotoItem[], index: number) => {
        setSelectedPhotos(photos);
        setInitialIndex(index);
        setViewerOpen(true);
    };

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <header className="sticky top-0 z-10 bg-background/80 py-4 backdrop-blur-md">
                <h1 className="text-2xl font-bold">그룹 피드</h1>
                <p className="text-sm text-muted-foreground">ID: {groupUuid}</p>
            </header>

            <FeedList type="group" groupUuid={groupUuid} onClickPhotoAction={handleImageClick}/>

            <CreatePostDialog groupUuid={groupUuid}/>
            <ImageViewer
                photoItems={selectedPhotos}
                initialIndex={initialIndex}
                open={viewerOpen}
                onOpenChange={setViewerOpen}
            />
        </div>
    );
}

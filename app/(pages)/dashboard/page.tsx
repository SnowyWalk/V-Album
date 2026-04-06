"use client";

import {useState} from "react";
import FeedList from "@/components/feed/feed-list";
import {ImageViewer, PhotoItem} from "@/components/image-viewer";

export default function DashboardPage() {
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
                <h1 className="text-2xl font-bold">통합 피드</h1>
                <p className="text-sm text-muted-foreground">
                    가입한 모든 그룹의 새로운 소식을 한눈에 확인하세요.
                </p>
            </header>

            <FeedList type="all" onClickPhotoAction={handleImageClick} />

            <ImageViewer
                photoItems={selectedPhotos}
                initialIndex={initialIndex}
                open={viewerOpen}
                onOpenChange={setViewerOpen}
            />
        </div>
    );
}

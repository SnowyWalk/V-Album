"use client";

import {useState} from "react";
import AllGroupsFeed from "@/components/all-groups-feed";
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
        <section className="mx-auto max-w-2xl px-4 py-8">
            <div className="mb-8 flex flex-col gap-2">
                <h1 className="text-2xl font-bold tracking-tight">통합 피드</h1>
                <p className="text-sm text-muted-foreground">
                    가입한 모든 그룹의 새로운 소식을 한눈에 확인하세요.
                </p>
            </div>

            <AllGroupsFeed onClickPhotoAction={handleImageClick} />

            <ImageViewer
                photoItems={selectedPhotos}
                initialIndex={initialIndex}
                open={viewerOpen}
                onOpenChange={setViewerOpen}
            />
        </section>
    );
}

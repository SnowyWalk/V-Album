"use client";

import {useState} from "react";
import AllGroupsFeed from "@/components/all-groups-feed";
import {ImageViewer, PhotoItem} from "@/components/image-viewer";

export default function DashboardPage() {
    const [viewerPhotos, setViewerPhotos] = useState<PhotoItem[] | null>(null);
    const [viewerIndex, setViewerIndex] = useState(0);

    const handlePhotoClick = (photos: PhotoItem[], index: number) => {
        setViewerPhotos(photos);
        setViewerIndex(index);
    };

    return (
        <section className="mx-auto max-w-2xl px-4 py-8">
            <div className="mb-8 flex flex-col gap-2">
                <h1 className="text-2xl font-bold tracking-tight">통합 피드</h1>
                <p className="text-sm text-muted-foreground">
                    가입한 모든 그룹의 새로운 소식을 한눈에 확인하세요.
                </p>
            </div>

            <AllGroupsFeed onClickPhoto={handlePhotoClick} />

            {viewerPhotos && (
                <ImageViewer
                    photos={viewerPhotos}
                    initialIndex={viewerIndex}
                    onClose={() => setViewerPhotos(null)}
                />
            )}
        </section>
    );
}

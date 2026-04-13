"use client";

import FeedList from "@/components/feed/feed-list";

export default function DashboardPage() {
    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <header className="sticky top-0 z-10 bg-background/80 py-4 backdrop-blur-md">
                <h1 className="text-2xl font-bold">통합 피드</h1>
                <p className="text-sm text-muted-foreground">
                    가입한 모든 그룹의 새로운 소식과 추억을 확인해보세요.
                </p>
            </header>

            <FeedList type="all"/>
        </div>
    );
}

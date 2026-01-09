"use client";

import { Card, CardContent } from "@/components/ui/card"
import CustomCalendar from "@/components/custom-calendar"

export default function DashboardPage() {
    const mockHighlightDates = [
        new Date(2025, 11, 25), // 2025년 12월 25일
        new Date(2026, 0, 1),   // 2026년 1월 1일
        new Date(2026, 0, 15),
        new Date(2026, 2, 10),  // 2026년 3월 10일
    ];

    const handleDateSelect = (date: Date) => {
        console.log("선택된 날짜:", date);
    };

    return (
        <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">대시보드</h1>
            <p className="text-muted-foreground">
                Google Sans Flex와 Noto Sans KR이 적용된 멋진 대시보드입니다.
            </p>
            <div className="grid gap-4 lg:grid-cols-1">
                <Card className="p-4 items-center">
                    <CardContent>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
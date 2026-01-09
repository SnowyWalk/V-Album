import { HeatCalendar } from "@/components/heat-calendar"
import { Card, CardContent } from "@/components/ui/card"

export default function DashboardPage() {
    return (
        <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">대시보드</h1>
            <p className="text-muted-foreground">
                Google Sans Flex와 Noto Sans KR이 적용된 멋진 대시보드입니다.
            </p>
            <div className="grid gap-4 lg:grid-cols-1">
                <Card className="p-4 items-center">
                    <CardContent>
                        <HeatCalendar />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
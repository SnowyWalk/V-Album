import { Card } from "@/components/ui/card"

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">대시보드</h1>
      <p className="text-muted-foreground">
        Google Sans Flex와 Noto Sans KR이 적용된 멋진 대시보드입니다.
      </p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* 여기에 shadcn/ui 카드 컴포넌트 등을 배치해 보세요 */}
        <Card className="p-6">카드 1</Card>
        <Card className="p-6">카드 2</Card>
        <Card className="p-6">카드 3</Card>
        <Card className="p-6">카드 4</Card>
      </div>
    </div>
  )
}
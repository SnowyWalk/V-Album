"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Sun, Moon } from "lucide-react" // 예시 아이콘
import { Button } from "@/components/ui/button"

export default function ThemeToggleButton() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    // 컴포넌트가 마운트된 후에만 렌더링되도록 설정
    useEffect(() => {
        setMounted(true)
    }, [])

    // 마운트되기 전에는 레이아웃이 깨지지 않도록 투명한 버튼이나 빈 공간을 반환
    if (!mounted) {
        return (
            <Button variant="outline" size="icon">
                <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />
            </Button >
        )
    }

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
            {theme === "dark" ? (
                <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />
            ) : (
                <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />
            )}
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function LoginFinishPage() {
    const router = useRouter()
    const [status, setStatus] = useState("로그인 완료 처리 중...")
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function finishLogin() {
            try {
                const res = await fetch("/api/login-to-backend", {
                    method: "POST",
                })

                if (!res.ok) {
                    const data = await res.json().catch(() => ({}))
                    throw new Error(data.error || "백엔드 로그인 실패")
                }

                // 성공 시 대시보드로 이동
                router.replace("/dashboard")
            } catch (err) {
                console.error("Login finish error:", err)
                setError(err instanceof Error ? err.message : "unknown error")
                setStatus("로그인 처리 중 오류가 발생했습니다.")
            }
        }

        finishLogin()
    }, [router])

    if (error) {
        return (
            <div className="p-6 space-y-3">
                <h1 className="text-lg font-semibold">오류 발생</h1>
                <p className="text-sm text-muted-foreground">{error}</p>
                <Button onClick={() => router.push("/login-start")}>
                    다시 시도
                </Button>
            </div>
        )
    }

    return <div className="p-6 text-sm text-muted-foreground">{status}</div>
}

"use client"

import { signIn } from "next-auth/react"
import { useEffect, useRef } from "react"

export default function LoginStartPage() {
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true

    // 구글 로그인 완료 후 /auth/finish로 복귀
    signIn("google", { callbackUrl: "/login-finish" })
  }, [])

  return <div style={{ padding: 24 }}>구글 로그인 진행 중...</div>
}
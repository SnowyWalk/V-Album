"use client"

import { signIn, useSession } from "next-auth/react"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const { status } = useSession()
  const router = useRouter()

  const didExchangeRef = useRef(false) // <-- 중복 호출 방지
  const [error, setError] = useState<string | null>(null)

  // 1) 이미 로그인(NextAuth 세션 확보)됐으면 백엔드에 1회 교환 요청
  useEffect(() => {
    if (status !== "authenticated") return
    if (didExchangeRef.current) return // <-- 중요: dev 모드 useEffect 2회 실행 방지
    didExchangeRef.current = true

      ; (async () => {
        setError(null)

        const res = await fetch("/api/login-to-backend", { method: "POST" })
        if (!res.ok) {
          const json = await res.json().catch(() => null)
          setError(json?.error ?? "backend login failed")
          return
        }

        // 여기서 보통:
        // - ASP.NET이 HttpOnly 쿠키로 세션/JWT를 내려주면, 프론트는 따로 저장할 필요 없음
        // - 또는 accessToken을 반환받아 클라이언트 저장 (비권장) 가능
        // router.replace("/") // <-- 교환 성공 후 홈으로
        window.opener.postMessage({ type: "AUTH_DONE" })
        window.close()
      })()
  }, [status, router])

  useEffect(() => {
    if (status === "unauthenticated")
      signIn("google", {redirect: false})
  }, [status])

  return (
    <div style={{ padding: 24 }}>
      {status}
      {status === "loading" && <p>세션 확인 중...</p>}
      {status === "authenticated" && <p>백엔드 로그인 처리 중...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  )
}
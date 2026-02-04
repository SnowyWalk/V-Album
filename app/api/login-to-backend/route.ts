import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"

export async function POST() {
  // 1) NextAuth 세션 확인 (서버에서 직접)
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json(
      { error: "not authenticated" },
      { status: 401 }
    )
  }

  // 2) 백엔드로 전달할 최소 정보 구성
  // (실무에서는 google sub / email 정도만 전달)
  const payload = {
    email: session.user?.email,
    name: session.user?.name,
  }

  // 3) ASP.NET 서버에 로그인 교환 요청
  const res = await fetch("https://localhost:7052/auth/login/google", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    credentials: "include", // 백엔드가 쿠키 내려주는 경우
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    return NextResponse.json(
      { error: "backend login failed", detail: text },
      { status: 502 } // Gateway 에러가 의미적으로 맞음
    )
  }

  // 4) 성공
  // - 백엔드가 HttpOnly 쿠키를 내려줬다면 여기서 할 일 없음
  return NextResponse.json({ ok: true })
}
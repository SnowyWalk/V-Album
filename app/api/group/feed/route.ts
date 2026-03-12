import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const jwt = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    const googleSub = typeof jwt?.googleSub === "string" ? jwt.googleSub : null
    if (!googleSub) {
        return NextResponse.json(
            { error: "google sub missing in NextAuth JWT" },
            { status: 401 }
        )
    }

    const { searchParams } = req.nextUrl
    const groupUuid = searchParams.get("groupUuid")
    const limit = searchParams.get("limit")
    const cursorDateTime = searchParams.get("cursorDateTime")
    const cursorPostUuid = searchParams.get("cursorPostUuid")

    if (!groupUuid) {
        return NextResponse.json(
            { error: "groupUuid is required" },
            { status: 400 }
        )
    }

    const params = new URLSearchParams({ groupUuid })
    if (limit) params.set("limit", limit)
    else params.set("limit", "10")
    if (cursorDateTime) params.set("cursorDateTime", cursorDateTime)
    if (cursorPostUuid) params.set("cursorPostUuid", cursorPostUuid)

    const backendUrl = process.env.BACKEND_BASE_URL
    const fullUrl = `${backendUrl}/api/group/feed?${params}`
    console.log("[feed] requesting:", fullUrl)  // ← 추가

    const res = await fetch(fullUrl, {
        method: "GET",
        headers: { "X-Google-Sub": googleSub },
    })
    console.log("[feed] backend status:", res.status)

    const text = await res.text()
    console.log("[feed] backend body:", text)  // ← 실제 응답 확인

    const json = text ? JSON.parse(text) : {}
    return NextResponse.json(json, { status: res.status })
}

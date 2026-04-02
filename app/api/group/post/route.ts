import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const jwt = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    const googleSub = typeof jwt?.googleSub === "string" ? jwt.googleSub : null
    if (!googleSub) {
        return NextResponse.json(
            { error: "google sub missing in NextAuth JWT" },
            { status: 401 }
        )
    }

    const formData = await req.formData()
    const backendUrl = process.env.BACKEND_BASE_URL
    const res = await fetch(`${backendUrl}/api/group/post`, {
        method: "POST",
        headers: {
            "X-Google-Sub": googleSub,
        },
        body: formData
    })
    
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return NextResponse.json(
            { error: errorData.error || "Backend server error" },
            { status: res.status }
        )
    }

    return NextResponse.json(await res.json(), { status: res.status })
}

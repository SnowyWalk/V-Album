import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    console.log("POST /api/group/post")
    const jwt = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    const googleSub = typeof jwt?.googleSub === "string" ? jwt.googleSub : null
    if (!googleSub) {
        return NextResponse.json(
            { error: "google sub missing in NextAuth JWT" },
            { status: 401 }
        )
    }
    console.log("POST /api/group/post 2")

    const formData = await req.formData()
    const backendUrl = process.env.BACKEND_BASE_URL
    console.log("POST /api/group/post 3", `${backendUrl}/api/group/post`    )
    
    const res = await fetch(`${backendUrl}/api/group/post`, {
        method: "POST",
        headers: {
            "X-Google-Sub": googleSub,
        },
        body: formData
    })
    
    console.log("POST /api/group/post 4", res.status, res.statusText)

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return NextResponse.json(
            { error: errorData.error || "Backend server error" },
            { status: res.status }
        )
    }

    return NextResponse.json(await res.json(), { status: res.status })
}

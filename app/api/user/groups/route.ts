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

    const backendUrl = process.env.BACKEND_BASE_URL
    const res = await fetch(`${backendUrl}/api/user/groups`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "X-Google-Sub": googleSub,
        }
    })

    return NextResponse.json(await res.json(), { status: res.status })
}

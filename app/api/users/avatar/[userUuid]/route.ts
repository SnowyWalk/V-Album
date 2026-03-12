import {NextRequest, NextResponse} from "next/server";
import {getToken} from "next-auth/jwt";

export async function GET(req: NextRequest,
                          {params}: { params: Promise<{ userUuid: string }> }) {
    const {userUuid} = await params;

    if (!userUuid) {
        return NextResponse.json(
            {error: "userUuid is required"},
            {status: 400}
        )
    }

    const jwt = await getToken({req, secret: process.env.NEXTAUTH_SECRET})
    const googleSub = typeof jwt?.googleSub === "string" ? jwt.googleSub : null
    if (!googleSub) {
        return NextResponse.json(
            {error: "google sub missing in NextAuth JWT"},
            {status: 401}
        )
    }

    const backendUrl = process.env.BACKEND_BASE_URL
    const res = await fetch(`${backendUrl}/api/user/avatar/${userUuid}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "X-Google-Sub": googleSub,
        }
    })

    if (!res.ok) {
        return NextResponse.json(
            {error: "Failed to fetch user avatar"},
            {status: res.status}
        )
    }
    
    return NextResponse.json(await res.json(), {status: res.status})
}
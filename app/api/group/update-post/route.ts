import {getToken} from "next-auth/jwt";
import {NextRequest, NextResponse} from "next/server";

export async function POST(req: NextRequest) {
    const jwt = await getToken({req, secret: process.env.NEXTAUTH_SECRET});
    const googleSub = typeof jwt?.googleSub === "string" ? jwt.googleSub : null;
    if (!googleSub) {
        return NextResponse.json(
            {error: "google sub missing in NextAuth JWT"},
            {status: 401}
        );
    }

    const {postUuid, content} = await req.json();
    if (!postUuid) {
        return NextResponse.json(
            {error: "postUuid is required"},
            {status: 400}
        );
    }

    const backendUrl = process.env.BACKEND_BASE_URL;
    const res = await fetch(`${backendUrl}/api/group/update-post`, {
        method: "POST",
        headers: {
            "X-Google-Sub": googleSub,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({postUuid, content}),
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return NextResponse.json(
            {error: errorData.error || "Backend server error"},
            {status: res.status}
        );
    }

    const text = await res.text();
    const body = text ? JSON.parse(text) : null;

    return NextResponse.json(body, {status: res.status});
}

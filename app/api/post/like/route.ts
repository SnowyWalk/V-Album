import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

type LikeMutationRequest = {
    postUuid?: string;
    mutationUuid?: string;
};

async function proxyLikeRequest(req: NextRequest, method: "PUT" | "DELETE") {
    const jwt = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const googleSub = typeof jwt?.googleSub === "string" ? jwt.googleSub : null;

    if (!googleSub) {
        return NextResponse.json(
            { error: "google sub missing in NextAuth JWT" },
            { status: 401 }
        );
    }

    const requestBody = await req.json().catch(() => null) as LikeMutationRequest | null;
    if (!requestBody?.postUuid || !requestBody?.mutationUuid) {
        return NextResponse.json(
            { error: "postUuid and mutationUuid are required" },
            { status: 400 }
        );
    }

    const backendUrl = process.env.BACKEND_BASE_URL;
    if (!backendUrl) {
        return NextResponse.json(
            { error: "BACKEND_BASE_URL is not configured" },
            { status: 500 }
        );
    }

    const response = await fetch(`${backendUrl}/api/post/like`, {
        method,
        headers: {
            "Content-Type": "application/json",
            "X-Google-Sub": googleSub,
        },
        body: JSON.stringify(requestBody),
    });

    const rawBody = await response.text();
    let payload: unknown = null;

    if (rawBody) {
        try {
            payload = JSON.parse(rawBody);
        } catch {
            payload = { error: rawBody };
        }
    }

    return NextResponse.json(payload, { status: response.status });
}

export async function PUT(req: NextRequest) {
    return proxyLikeRequest(req, "PUT");
}

export async function DELETE(req: NextRequest) {
    return proxyLikeRequest(req, "DELETE");
}

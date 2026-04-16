import {getToken} from "next-auth/jwt";
import {NextRequest, NextResponse} from "next/server";

type GetCommentQuery = {
    postUuid?: string | null;
};

type PutCommentRequest = {
    postUuid?: string;
    content?: string;
};

async function getGoogleSub(req: NextRequest) {
    const jwt = await getToken({req, secret: process.env.NEXTAUTH_SECRET});
    return typeof jwt?.googleSub === "string" ? jwt.googleSub : null;
}

export async function GET(req: NextRequest) {
    const googleSub = await getGoogleSub(req);
    if (!googleSub) {
        return NextResponse.json(
            {error: "google sub missing in NextAuth JWT"},
            {status: 401}
        );
    }

    const {searchParams} = req.nextUrl;
    const {postUuid}: GetCommentQuery = {
        postUuid: searchParams.get("postUuid"),
    };

    if (!postUuid) {
        return NextResponse.json(
            {error: "postUuid is required"},
            {status: 400}
        );
    }

    const backendUrl = process.env.BACKEND_BASE_URL;
    if (!backendUrl) {
        return NextResponse.json(
            {error: "BACKEND_BASE_URL is not configured"},
            {status: 500}
        );
    }

    const response = await fetch(`${backendUrl}/api/post/comment?PostUuid=${encodeURIComponent(postUuid)}`, {
        method: "GET",
        headers: {
            "X-Google-Sub": googleSub,
        },
        cache: "no-store",
    });

    const rawBody = await response.text();
    let payload: unknown = null;

    if (rawBody) {
        try {
            payload = JSON.parse(rawBody);
        } catch {
            payload = {error: rawBody};
        }
    }

    return NextResponse.json(payload, {status: response.status});
}

export async function PUT(req: NextRequest) {
    const googleSub = await getGoogleSub(req);
    if (!googleSub) {
        return NextResponse.json(
            {error: "google sub missing in NextAuth JWT"},
            {status: 401}
        );
    }

    const requestBody = await req.json().catch(() => null) as PutCommentRequest | null;
    if (!requestBody?.postUuid || !requestBody?.content?.trim()) {
        return NextResponse.json(
            {error: "postUuid and content are required"},
            {status: 400}
        );
    }

    const backendUrl = process.env.BACKEND_BASE_URL;
    if (!backendUrl) {
        return NextResponse.json(
            {error: "BACKEND_BASE_URL is not configured"},
            {status: 500}
        );
    }

    const response = await fetch(`${backendUrl}/api/post/comment`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "X-Google-Sub": googleSub,
        },
        body: JSON.stringify({
            PostUuid: requestBody.postUuid,
            Content: requestBody.content.trim(),
        }),
    });

    const rawBody = await response.text();
    let payload: unknown = null;

    if (rawBody) {
        try {
            payload = JSON.parse(rawBody);
        } catch {
            payload = {error: rawBody};
        }
    }

    return NextResponse.json(payload, {status: response.status});
}

import {NextRequest, NextResponse} from "next/server";
import {createServerApiClient} from "@/lib/api/server-api-client";
import {DeleteCommentRequest, PutCommentRequest} from "@/lib/api/schema-alias";

export async function GET(req: NextRequest) {
    const api = await createServerApiClient(req);
    if (!api) {
        return NextResponse.json(
            {error: "google sub missing in NextAuth JWT"},
            {status: 401}
        );
    }

    const {searchParams} = req.nextUrl;
    const postUuid = searchParams.get("PostUuid")

    if (!postUuid) {
        return NextResponse.json(
            {error: "postUuid is required"},
            {status: 400}
        );
    }

    const {data, error} = await api.GET("/api/post/comment", {
        params: {
            query: {
                PostUuid: postUuid
            }
        },
        cache: "no-store"
    })

    const payload = data ?? error ?? null;
    return NextResponse.json(payload, {status: error ? 400 : 200});
}

export async function PUT(req: NextRequest) {
    const api = await createServerApiClient(req);
    if (!api) {
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

    const {data, error} = await api.PUT("/api/post/comment", {
        body: {
            postUuid: requestBody.postUuid,
            content: requestBody.content.trim(),
        }
    })

    const payload = data ?? error ?? null;
    return NextResponse.json(payload, {status: error ? 400 : 200});
}

export async function DELETE(req: NextRequest) {
    const api = await createServerApiClient(req);
    if (!api) {
        return NextResponse.json(
            {error: "google sub missing in NextAuth JWT"},
            {status: 401}
        );
    }

    const requestBody = await req.json().catch(() => null) as DeleteCommentRequest | null;
    if (!requestBody?.postUuid || !requestBody?.commentUuid) {
        return NextResponse.json(
            {error: "postUuid and commentUuid are required"},
            {status: 400}
        );
    }

    const {data, error} = await api.DELETE("/api/post/comment", {
        body: {
            postUuid: requestBody.postUuid,
            commentUuid: requestBody.commentUuid,
        }
    })

    const payload = data ?? error ?? null;
    return NextResponse.json(payload, {status: error ? 400 : 200});
}

import {NextRequest, NextResponse} from "next/server";
import {createApiClient} from "@/lib/api/client";
import {components} from "@/lib/api/schema";

export async function GET(req: NextRequest) {
    const api = await createApiClient(req);
    if (!api) {
        return NextResponse.json(
            {error: "google sub missing in NextAuth JWT"},
            {status: 401}
        );
    }

    const {searchParams} = req.nextUrl;
    const postUuid = searchParams.get("postUuid")

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
    const api = await createApiClient(req);
    if (!api) {
        return NextResponse.json(
            {error: "google sub missing in NextAuth JWT"},
            {status: 401}
        );
    }

    const requestBody = await req.json().catch(() => null) as components["schemas"]["PutCommentRequest"] | null;
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

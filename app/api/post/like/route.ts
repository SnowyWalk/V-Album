import {NextRequest, NextResponse} from "next/server";
import {createServerApiClient} from "@/lib/api/server-api-client";
import {PutLikeRequest} from "@/lib/api/schema-alias";

async function proxyLikeRequest(req: NextRequest, method: "PUT" | "DELETE") {
    const api = await createServerApiClient(req);
    if (!api) {
        return NextResponse.json(
            {error: "google sub missing in NextAuth JWT"},
            {status: 401}
        );
    }

    const requestBody = await req.json().catch(() => null) as PutLikeRequest | null;
    if (!requestBody?.postUuid || !requestBody?.mutationUuid) {
        return NextResponse.json(
            {error: "postUuid and mutationUuid are required"},
            {status: 400}
        );
    }

    let payload: unknown = null;
    let status: number = 0;
    if (method === "PUT") {
        const {data, error} = await api.PUT("/api/post/like", {
            body: requestBody
        })
        payload = data ?? error ?? null;
        status = error ? 400 : 200;
    }
    else if (method == "DELETE")
    {
        const {data, error} = await api.DELETE("/api/post/like", {
            body: requestBody
        })
        payload = data ?? error ?? null;
        status = error ? 400 : 200;
    }
    
    return NextResponse.json(payload, {status: status});
}

export async function PUT(req: NextRequest) {
    return proxyLikeRequest(req, "PUT");
}

export async function DELETE(req: NextRequest) {
    return proxyLikeRequest(req, "DELETE");
}

import {NextRequest, NextResponse} from "next/server";
import {createApiClient} from "@/lib/api/client";

export async function GET(req: NextRequest) {
    const {searchParams} = req.nextUrl;
    const limitRaw = searchParams.get("limit") || "10";
    const cursorDateTime = searchParams.get("cursorDateTime");
    const cursorPostUuid = searchParams.get("cursorPostUuid");

    const limit = limitRaw == null ? 10 : Number(limitRaw);
    if (!Number.isInteger(limit) || limit <= 0) { // 변경된 부분
        return NextResponse.json(
            {error: "limit must be a positive integer"},
            {status: 400}
        );
    }

    const api = await createApiClient(req);
    if (!api) {
        return NextResponse.json(
            {error: "google sub missing in NextAuth JWT"},
            {status: 401}
        );
    }

    const {data, error} = await api.GET("/api/group/feed/all", {
        params: {
            query: {
                Limit: Number(limit),
                CursorDateTime: cursorDateTime ?? undefined,
                CursorPostUuid: cursorPostUuid ?? undefined,
            }
        }
    })

    if (error) {
        return NextResponse.json({error}, {status: 400});
    }

    return NextResponse.json(data);
}

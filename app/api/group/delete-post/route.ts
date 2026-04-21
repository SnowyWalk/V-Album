import {NextRequest, NextResponse} from "next/server";
import {createApiClient} from "@/lib/api/client";

export async function POST(req: NextRequest) {
    const {postUuid} = await req.json()
    if (!postUuid) {
        return NextResponse.json(
            {error: "postUuid is required"},
            {status: 400}
        )
    }

    const api = await createApiClient(req);
    if (!api) {
        return NextResponse.json(
            {error: "google sub missing in NextAuth JWT"},
            {status: 401}
        );
    }

    const {data, error} = await api.POST("/api/group/delete-post", {
        body: {
            postUuid
        }
    })

    if (error) {
        return NextResponse.json({error}, {status: 400});
    }

    if (data == null) {
        return new NextResponse(null, {status: 200});
    }

    return NextResponse.json(data);
}

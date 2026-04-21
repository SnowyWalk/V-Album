import {NextRequest, NextResponse} from "next/server";
import {createApiClient} from "@/lib/api/client";

export async function POST(req: NextRequest) {
    const {groupName} = await req.json()
    if (!groupName) {
        return NextResponse.json(
            {error: "groupName is required"},
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

    const {data, error} = await api.POST("/api/group/create", {
        body: {
            groupName
        }
    })

    if (error) {
        return NextResponse.json({error}, {status: 400});
    }

    return NextResponse.json(data);
}

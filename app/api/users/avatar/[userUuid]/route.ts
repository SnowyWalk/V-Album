import {NextRequest, NextResponse} from "next/server";
import {createApiClient} from "@/lib/api/client";

export async function GET(req: NextRequest,
                          {params}: { params: Promise<{ userUuid: string }> }) {
    const {userUuid} = await params;

    if (!userUuid) {
        return NextResponse.json(
            {error: "userUuid is required"},
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
    
    const {data, error} = await api.GET("/api/user/avatar/{userUuid}", {
        params: {
            path: {
                userUuid: userUuid
            }
        }
    })
    
    if (error) {
        return NextResponse.json(
            {error: "Failed to fetch user avatar"},
            {status: 400}
        )
    }
    
    return NextResponse.json(data)
}
import {NextRequest, NextResponse} from "next/server";
import {createServerApiClient} from "@/lib/api/server-api-client";

export async function GET(req: NextRequest) {
    const api = await createServerApiClient(req);
    if (!api) {
        return NextResponse.json(
            {error: "google sub missing in NextAuth JWT"},
            {status: 401}
        );
    }

    const {data, error} = await api.GET("/api/user/groups")
    return NextResponse.json(data, {status: error ? 400 : 200})
}

import createClient from "openapi-fetch";
import {NextRequest, NextResponse} from "next/server";
import type {paths} from "@/lib/api/schema";

export async function GET(
    _req: NextRequest,
    {params}: { params: Promise<unknown> }
) {
    const {userUuid} = await params as { userUuid?: string };

    if (!userUuid) {
        return NextResponse.json(
            {error: "userUuid is required"},
            {status: 400}
        )
    }

    const baseUrl = process.env.BACKEND_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error("Missing BACKEND_BASE_URL for API client");
    }

    const api = createClient<paths>({baseUrl});
    const {data, error} = await api.GET("/api/user/avatar/{userUuid}", {
        params: {
            path: {
                userUuid
            }
        }
    })

    if (error) {
        return NextResponse.json(error, {status: 404})
    }

    return NextResponse.json(data)
}

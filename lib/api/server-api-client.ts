import createClient from "openapi-fetch";
import type {paths} from "@/lib/api/schema";
import {NextRequest} from "next/server";
import {getToken} from "next-auth/jwt";

export async function createServerApiClient(request: NextRequest) {
    const jwt = await getToken({req: request, secret: process.env.NEXTAUTH_SECRET});
    const googleSub = typeof jwt?.googleSub === "string" ? jwt.googleSub : null;
    if (!googleSub)
        return null;

    const baseUrl = process.env.BACKEND_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl)
        throw new Error("Missing BACKEND_BASE_URL for API client");

    return createClient<paths>({
        baseUrl,
        headers: {
            "X-Google-Sub": googleSub,
        },
    })
}

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
    const token = await getToken({ req });
    const googleSub = token?.googleSub as string;

    if (!googleSub) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit") || "10";
    const cursorDateTime = searchParams.get("cursorDateTime");
    const cursorPostUuid = searchParams.get("cursorPostUuid");

    let backendUrl = `${process.env.BACKEND_BASE_URL}/api/group/feed/all?limit=${limit}`;
    if (cursorDateTime) backendUrl += `&cursorDateTime=${cursorDateTime}`;
    if (cursorPostUuid) backendUrl += `&cursorPostUuid=${cursorPostUuid}`;

    try {
        const response = await fetch(backendUrl, {
            headers: {
                "X-Google-Sub": googleSub,
                "Accept": "application/json",
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(errorData, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Failed to fetch all feed:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

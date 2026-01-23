import { NextResponse } from "next/server";

const ASPNET_BASE_URL = process.env.ASPNET_BASE_URL ?? "http://localhost:5299";

export async function POST(request: Request) {
  let payload: unknown = null;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON body." },
      { status: 400 },
    );
  }

  try {
    const targetUrl = new URL("/auth/nickname", ASPNET_BASE_URL);
    const response = await fetch(targetUrl.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload ?? {}),
    });

    const contentType = response.headers.get("content-type") ?? "application/json";
    const bodyText = await response.text();
    return new NextResponse(bodyText, {
      status: response.status,
      headers: { "Content-Type": contentType },
    });
  } catch {
    return NextResponse.json(
      { message: "Failed to reach ASP.NET server." },
      { status: 502 },
    );
  }
}

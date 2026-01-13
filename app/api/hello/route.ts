import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // 서버에서만 안전하게 처리할 로직 (DB 조회, 내부 API 호출 등)
  const now = new Date().toLocaleString();

  return NextResponse.json({
    message: "Hello from server API!",
    serverTime: now,
  });
}
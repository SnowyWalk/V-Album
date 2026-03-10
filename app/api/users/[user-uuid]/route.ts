import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: { uuid: string } }
) {
    const { uuid } = params;

    // 예시: 실제로는 DB 조회
    const user = {
        uuid,
        name: "홍길동",
        pic: null,
    };

    return NextResponse.json(user);
}
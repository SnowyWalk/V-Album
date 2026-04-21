import {NextResponse, NextRequest} from "next/server"
import {getServerSession} from "next-auth"
import {authOptions} from "@/auth"
import {getToken} from "next-auth/jwt"
import {createApiClient} from "@/lib/api/client";

export async function POST(req: NextRequest) {
    // 1) NextAuth 세션 확인 (서버에서 직접)
    const session = await getServerSession(authOptions)

    if (!session) {
        return NextResponse.json(
            {error: "not authenticated"},
            {status: 401}
        )
    }

    // 2) NextAuth JWT에서 googleIdToken 추출
    const jwt = await getToken({req, secret: process.env.NEXTAUTH_SECRET})
    const googleIdToken =
        typeof jwt?.googleIdToken === "string" ? jwt.googleIdToken : undefined

    if (!googleIdToken) {
        return NextResponse.json(
            {error: "google id token missing in NextAuth JWT"},
            {status: 401}
        )
    }

    // 2) 백엔드로 전달할 최소 정보 구성
    // (실무에서는 google sub / email 정도만 전달)
    const payload = {
        email: session.user?.email,
        name: session.user?.name,
        googleIdToken, // <-- auth.ts에서 주입한 값 사용
    }

    const api = await createApiClient(req);
    if (!api) {
        return NextResponse.json(
            {error: "google sub missing in NextAuth JWT"},
            {status: 401}
        );
    }

    const {error} = await api.POST("/api/auth/login/google", {
        body: payload
    })
    
    if (error) {
        return NextResponse.json(
            {error: "backend login failed", detail: error},
            {status: 502} // Gateway 에러가 의미적으로 맞음
        )
    }

    // 4) 성공
    return NextResponse.json({success: true})
}
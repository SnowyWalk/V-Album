"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMe } from "@/hooks/use-me";
import { getSession, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";


export default function DashboardPage() {
    const { status, data } = useSession();
    const { data: me , isLoading: isMeLoading } = useMe();
    const router = useRouter();

    console.log("Session status:", status);
    console.log("Session data:", data);
    console.log("Me data:", me);

    return (
        <section>
            <div className="relative inline-block">
                <div className="min-w-23 h-10" />

                {
                    status === "loading" &&
                    <div className="absolute inset-0">
                        <Skeleton className="h-10 w-full rounded-md" /> {/* <-- 변경 */}
                    </div>
                }

                {
                    status === "unauthenticated" &&
                    <Button variant={"outline"} className="absolute inset-0" onClick={() => {
                        window.open(
                            "/login-start",
                            "google-login",
                            "popup=yes,width=520,height=700"
                        )
                    }}>로그인</Button>
                }

                {
                    status === "authenticated" &&
                    <Button variant={"outline"} className="absolute inset-0" onClick={async () => {
                        await signOut({ redirect: false })
                        router.refresh() // <-- 추가
                    }}>로그아웃</Button>
                }
            </div>

            <br />
            <Card className="p-4 w-120">
                <CardTitle>대시보드</CardTitle>
                <CardContent>대시보드에 오신 것을 환영합니다!</CardContent>
            </Card>

            <Card className="p-4 w-120">
                <CardTitle>로그인 정보</CardTitle>
                <CardContent>
                    {isMeLoading ? (
                        <Skeleton className="h-4 w-full" />
                    ) : me ? (
                        <div>
                            <p>닉네임: {me.nickname}</p>
                            <p>UUID: {me.userUuid}</p>
                        </div>
                    ) : (
                        <p>로그인 정보를 불러올 수 없습니다.</p>
                    )}
                </CardContent>
            </Card>
        </section >
    );
}
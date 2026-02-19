"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getSession, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";


export default function DashboardPage() {
    const { status, data } = useSession();
    const router = useRouter();

    console.log("Session status:", status);
    console.log("Session data:", data);

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
                            "/login",
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
        </section >
    );
}
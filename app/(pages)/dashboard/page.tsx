"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMe } from "@/hooks/use-me";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const { status, update } = useSession();
    const { data: me, isLoading: isMeLoading, resetMe } = useMe();
    const router = useRouter();

    return (
        <section>
            <div className="relative inline-block">
                <div className="min-w-23 h-10" />

                {
                    status === "loading" &&
                    <div className="absolute inset-0">
                        <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                }

                {
                    status === "unauthenticated" &&
                    <Button variant={"outline"} className="absolute inset-0" onClick={() => {
                        router.push("/login-start");
                    }}>로그인</Button>
                }

                {
                    status === "authenticated" &&
                    <Button variant={"outline"} className="absolute inset-0" onClick={async () => {
                        await signOut({ redirect: false });
                        await update();
                        resetMe();
                        router.refresh();
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
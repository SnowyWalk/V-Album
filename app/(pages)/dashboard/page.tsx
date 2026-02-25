"use client";

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";
import {MeDto, useMe} from "@/hooks/use-me";
import {signOut, useSession} from "next-auth/react";
import {useRouter} from "next/navigation";

export default function DashboardPage() {
    const {status, update} = useSession();
    const {data: me, isLoading: isMeLoading, resetMe} = useMe();
    const router = useRouter();

    const loginStatus = ({status, isMeLoading, me}: { status: "authenticated" | "loading" | "unauthenticated", isMeLoading: boolean, me: MeDto | null | undefined }) => {
        if (isMeLoading || status === "loading")
            return (
                <div>
                    <Skeleton className="h-4 mb-2 w-full"/>
                    <Skeleton className="h-4 mb-2 w-3/4"/>
                </div>
            );

        if (me) {
            return (
                <div>
                    <p>닉네임: {me.nickname}</p>
                    <p>UUID: {me.userUuid}</p>
                </div>
            )
        }

        return <p>No Data {status}</p>;
    };

    return (
        <section>
            <div className="relative inline-block">
                <div className="min-w-23 h-10"/>

                {
                    status === "loading" &&
                    <div className="absolute inset-0">
                        <Skeleton className="h-10 w-full rounded-md"/>
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
                        await signOut({redirect: false});
                        await update();
                        resetMe();
                        router.refresh();
                    }}>로그아웃</Button>
                }
            </div>

            <br/>

            <Card className="w-120">
                <CardHeader>
                    <CardTitle>로그인 정보</CardTitle>
                </CardHeader>
                <CardContent>
                    {loginStatus({status, isMeLoading, me})}
                </CardContent>
            </Card>
        </section>
    );
}
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { signOut, useSession } from "next-auth/react";


export default function DashboardPage() {
    const { status } = useSession();

    return (
        <section>
            { 
                status !== "authenticated" &&
                <Button variant={"outline"} onClick={() => {
                    window.open(
                        "/login",
                        "google-login",
                        "popup=yes,width=520,height=700"
                    )
                }}>로그인</Button>
            }

            {
                status == "authenticated" &&
                <Button variant={"outline"} onClick={() => signOut({ redirect: false })}>로그아웃</Button>
            }
            <br />
            <Card className="p-4">
                <CardTitle>대시보드</CardTitle>
                <CardContent>대시보드에 오신 것을 환영합니다!</CardContent>
            </Card>
        </section>
    );
}
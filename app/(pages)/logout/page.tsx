"use client";

import { signOut, useSession } from "next-auth/react"


export default function LogoutPage() {
    signOut({ callbackUrl: "/dashboard" });

  return (
    <div style={{ padding: 24 }}>
      <p>로그아웃 처리 중...</p>
    </div>
  );
}
// /auth.ts
import type { NextAuthOptions } from "next-auth" // <-- 변경: 타입 추가
import GoogleProvider from "next-auth/providers/google" // <-- 변경: Provider 이름/패턴

export const authOptions: NextAuthOptions = { // <-- 변경: 옵션 export
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account }) {
      if (account?.provider === "google" && account.id_token) {
        (token as any).googleIdToken = account.id_token // <-- 변경: id_token 저장
      }
      return token
    },
    async session({ session, token }) { // <-- 변경: v4에선 token을 받아서 session에 주입
      (session as any).googleIdToken = (token as any).googleIdToken // <-- 변경
      return session
    },
  },
}
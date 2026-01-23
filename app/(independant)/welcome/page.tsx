"use client";

import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider";
import ThemeToggleButton from "@/components/theme-toggle-button";
import { Noto_Sans_KR } from 'next/font/google'
import localFont from 'next/font/local'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useMemo, useState } from "react";
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles } from "lucide-react";

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['100', '400', '700', '900'],
  variable: '--font-noto-sans-kr',
  display: 'swap',
});

const googleSansFlex = localFont({
  src: '../../../public/fonts/GoogleSansFlex-VariableFont_GRAD,ROND,opsz,slnt,wdth,wght.ttf',
  variable: '--font-google-sans-flex',
  display: 'swap',
});

export default function WelcomePage() {
  const router = useRouter();

  const [nickname, setNickname] = useState('');
  const [guestLoading, setGuestLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const trimmed = useMemo(() => nickname.trim(), [nickname]);
  const canGuest = trimmed.length > 0;

  const onGuestLogin = async () => {
    if (!canGuest || guestLoading) return;
    setGuestLoading(true);
    try {
      const response = await fetch('/auth/nickname', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: trimmed }),
      });

      if (!response.ok) {
        throw new Error('닉네임 인증에 실패했어.');
      }

      const data = await response.json() as {
        userUuid?: string;
        displayName?: string;
        userType?: string;
      };

      localStorage.setItem(
        'nickname',
        JSON.stringify({
          nickname: data.displayName ?? trimmed,
          userUuid: data.userUuid,
          userType: data.userType,
          statusText: '둘러보는 중',
        }),
      );
      router.replace('/'); // ✅ 필요하면 변경
    } finally {
      setGuestLoading(false);
    }
  };

  const onGoogleLogin = async () => {
    if (googleLoading) return;
    setGoogleLoading(true);
    try {
      // TODO: 구글 로그인 처리
      console.log('google login');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <html lang="ko" suppressHydrationWarning className={`${notoSansKR.variable} ${googleSansFlex.variable}`}>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <header className="flex h-12 shrink-0 items-center justify-between px-4 transition-[width] ease-linear border-b-2">
            <div className="flex items-center gap-2" />
            <ThemeToggleButton />
          </header>

          <main className="relative min-h-dvh w-full overflow-hidden">
            {/* 배경 */}
            <div className="pointer-events-none absolute inset-0 -z-10">
              <div className="absolute inset-0 bg-linear-to-b from-background via-background to-muted/40" />
              <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
              <div className="absolute left-[15%] top-[20%] h-[260px] w-[260px] rounded-full bg-muted/60 blur-3xl" />
              <div className="absolute right-[10%] bottom-[15%] h-[300px] w-[300px] rounded-full bg-primary/10 blur-3xl" />
            </div>

            <div className="min-h-dvh w-full flex items-center justify-center px-4 py-10">
              <Card className="w-full max-w-md border-muted/60 bg-background/70 backdrop-blur supports-backdrop-filter:bg-background/60 shadow-lg">
                <CardHeader className="space-y-3 text-center">
                  <div className="mx-auto inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs text-muted-foreground">
                    <Sparkles className="h-4 w-4" />
                    빠르게 시작하기
                  </div>

                  <CardTitle className="text-2xl tracking-tight">환영합니다!</CardTitle>

                  <p className="text-sm text-muted-foreground">
                    게스트로 가볍게 둘러보거나, 구글로 안전하게 로그인할 수 있어.
                  </p>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* 게스트 로그인 */}
                  <section className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">게스트 로그인</div>
                      <div className="text-xs text-muted-foreground">닉네임은 언제든 변경 가능</div>
                    </div>

                    <div className="flex gap-2">
                      <Input
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="닉네임 입력"
                        autoComplete="off"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') onGuestLogin(); // ✅ Enter로 진행
                        }}
                        className="h-11"
                      />
                      <Button
                        type="button"
                        onClick={onGuestLogin}
                        disabled={!canGuest || guestLoading}
                        className="h-11 px-4"
                        aria-label="게스트 로그인"
                      >
                        {guestLoading ? (
                          <span className="text-sm">...</span>
                        ) : (
                          <ArrowRight className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      게스트는 일부 기능이 제한될 수 있어.
                    </p>
                  </section>

                  {/* 구분선 */}
                  <div className="flex items-center gap-3">
                    <Separator className="flex-1" />
                    <span className="text-xs text-muted-foreground">또는</span>
                    <Separator className="flex-1" />
                  </div>

                  {/* 구글 로그인 */}
                  <section className="space-y-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 w-full border shadow-sm flex items-center justify-center gap-3"
                      onClick={onGoogleLogin}
                      disabled={googleLoading}
                    >
                      {/* 공식 Google G 아이콘 (SVG) */}
                      <svg width="18" height="18" viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.32 1.54 8.21 3.26l6.01-6.01C34.61 3.21 29.74 1 24 1 14.78 1 6.92 6.84 3.27 14.11l6.99 5.43C12.11 13.2 17.56 9.5 24 9.5z" />
                        <path fill="#4285F4" d="M46.1 24.5c0-1.64-.15-3.21-.43-4.74H24v9.01h12.39c-.53 2.85-2.15 5.26-4.57 6.88l7.01 5.43C43.98 36.44 46.1 30.96 46.1 24.5z" />
                        <path fill="#FBBC05" d="M10.26 28.54a14.47 14.47 0 0 1 0-9.08l-6.99-5.43A23.93 23.93 0 0 0 1 24c0 3.87.93 7.53 2.27 10.97l6.99-5.43z" />
                        <path fill="#34A853" d="M24 47c6.48 0 11.91-2.13 15.88-5.92l-7.01-5.43c-1.94 1.3-4.42 2.07-8.87 2.07-6.44 0-11.89-3.7-13.74-9.04l-6.99 5.43C6.92 41.16 14.78 47 24 47z" />
                      </svg>

                      <span className="text-sm font-medium">
                        {googleLoading ? '로그인 중...' : 'Google로 계속하기'}
                      </span>
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      로그인하면 기기 변경 후에도 데이터를 안전하게 유지할 수 있어.
                    </p>
                  </section>

                </CardContent>
              </Card>
            </div>
          </main>

        </ThemeProvider>
      </body>
    </html>
  );
}

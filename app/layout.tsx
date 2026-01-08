// app/layout.tsx
import "./globals.css"
import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import { Noto_Sans_KR } from 'next/font/google'
import localFont from 'next/font/local'
import ThemeToggleButton from "@/components/theme-toggle-button"
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export const metadata: Metadata = { title: "My App" }

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['100', '400', '700', '900'],
  variable: '--font-noto-sans-kr',
  display: 'swap',
});

const googleSansFlex = localFont({
  src: '../public/fonts/GoogleSansFlex-VariableFont_GRAD,ROND,opsz,slnt,wdth,wght.ttf',
  variable: '--font-google-sans-flex',
  display: 'swap',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning className={`${notoSansKR.variable} ${googleSansFlex.variable}`}>
      {/* Tailwind v4와 조합을 위해 body에 font-sans와 antialiased를 추가합니다. */}
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <SidebarProvider>
            {/* 좌측 네비게이션 */}
            <AppSidebar />
            
            <SidebarInset>
              {/* 상단바 공간: 사이드바 토글 버튼과 테마 버튼 배치 */}
              <header className="flex h-12 shrink-0 items-center justify-between px-4 transition-[width] ease-linear border-b-2">
                <div className="flex items-center gap-2">
                  <SidebarTrigger />
                </div>
                <ThemeToggleButton />
              </header>

              {/* 실제 페이지 내용 */}
              <main className="p-6">
                {children}
              </main>
            </SidebarInset>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
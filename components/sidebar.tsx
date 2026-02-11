"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

import {
  LayoutDashboard,
  Folder,
  Settings,
  Menu,
  LogOut,
} from "lucide-react"

type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const NAV: NavItem[] = [
  { href: "/dashboard", label: "대시보드", icon: LayoutDashboard },
  { href: "/projects", label: "프로젝트", icon: Folder },
  { href: "/settings", label: "설정", icon: Settings },
]

function NavLink({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const pathname = usePathname()
  const active = pathname === item.href
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
        "hover:bg-muted",
        active && "bg-muted font-medium"
      )}
    >
      <Icon className="h-4 w-4" />
      <span className="truncate">{item.label}</span>
    </Link>
  )
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-4 py-4">
        <div className="text-base font-semibold">My App</div>
        <div className="text-xs text-muted-foreground">shadcn sidebar</div>
      </div>

      <Separator />

      <ScrollArea className="flex-1">
        <nav className="px-2 py-3 space-y-1">
          {NAV.map((item) => (
            <NavLink key={item.href} item={item} onNavigate={onNavigate} />
          ))}
        </nav>
      </ScrollArea>

      <Separator />

      <div className="p-2">
        <Button variant="ghost" className="w-full justify-start gap-2">
          <LogOut className="h-4 w-4" />
          로그아웃
        </Button>
      </div>
    </div>
  )
}

/**
 * 기본 레이아웃:
 * - 데스크탑: 좌측 고정 sidebar
 * - 모바일: Sheet로 sidebar 열기
 */
export default function SidebarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="min-h-screen">
      {/* Top bar (mobile) */}
      <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b bg-background px-4 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Open menu">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <SidebarContent onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>

        <div className="font-semibold">대시보드</div>
      </header>

      <div className="grid md:grid-cols-[280px_1fr]">
        {/* Desktop sidebar */}
        <aside className="hidden md:block h-screen sticky top-0 border-r bg-background">
          <SidebarContent />
        </aside>

        {/* Main */}
        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

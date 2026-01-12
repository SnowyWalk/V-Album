// components/app-sidebar.tsx
"use client";

import { Home, Settings, User, LayoutDashboard } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  SidebarFooter,        // ✅ 추가
  SidebarSeparator,     // ✅ 추가
} from "@/components/ui/sidebar";
import CustomCalendar from "./custom-calendar";
import { useEffect, useMemo, useState } from "react"; // ✅ 추가
import { cn } from "@/lib/utils"; // ✅ 추가

const items = [
  { title: "대시보드", url: "/dashboard", icon: LayoutDashboard },
  { title: "사용자 관리", url: "#", icon: User },
  { title: "설정", url: "#", icon: Settings },
  { title: "홈", url: "#", icon: Home },
];

// ✅ 추가: 사이드바 하단 “내 정보” UI용 타입 (필요하면 네가 확장)
type SidebarUser = {
  nickname: string;
  email?: string;
  avatarUrl?: string;
  statusText?: string;
};

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const mockHighlightDates = [
    new Date(2025, 11, 25),
    new Date(2026, 0, 1),
    new Date(2026, 0, 15),
    new Date(2026, 2, 10),
  ];

  const handleDateSelect = (date: Date) => {
    console.log("선택된 날짜:", date);
  };

  // ✅ 추가: localStorage에서 유저 정보 읽어오기 (CSR에서만)
  const [me, setMe] = useState<SidebarUser>({
    nickname: "게스트",
    statusText: "둘러보는 중",
  });

  useEffect(() => {
    // ✅ 여기부터 네 서비스에 맞게 키/구조만 바꾸면 돼
    // 예시 1) 단일 키로 JSON 저장: localStorage.setItem("me", JSON.stringify({...}))
    const raw = localStorage.getItem("nickname");
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Partial<SidebarUser>;
        setMe((prev) => ({
          nickname: parsed.nickname?.trim() || prev.nickname,
          email: parsed.email || prev.email,
          avatarUrl: parsed.avatarUrl || prev.avatarUrl,
          statusText: parsed.statusText || prev.statusText,
        }));
        return;
      } catch {
        // JSON 파싱 실패 시 아래 fallback 사용
      }
    }

    // 예시 2) 키가 따로 있을 때 fallback
    const nickname = localStorage.getItem("nickname")?.trim();
    const email = localStorage.getItem("email")?.trim();
    const avatarUrl = localStorage.getItem("avatarUrl")?.trim();

    setMe((prev) => ({
      nickname: nickname || prev.nickname,
      email: email || prev.email,
      avatarUrl: avatarUrl || prev.avatarUrl,
      statusText: prev.statusText,
    }));
  }, []);

  const initials = useMemo(() => {
    const n = (me.nickname || "").trim();
    if (!n) return "G";
    return n.length >= 2 ? n.slice(0, 2) : n.slice(0, 1);
  }, [me.nickname]);

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarContent>
        <SidebarGroup className="overflow-hidden">
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground">
            메뉴
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <a href={item.url} className="flex items-center gap-3">
                      <item.icon className="size-5" />
                      <span className="font-sans font-medium">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>

          <SidebarSeparator className="my-1 mx-0" />

          <SidebarGroupContent
            className={cn(
              "origin-top-left transition-transform duration-200 ease-linear",
              isCollapsed
                ? "scale-0"
                : "scale-100"
            )}
          >
            <CustomCalendar
              highlightDates={mockHighlightDates}
              onDateSelect={handleDateSelect}
              className="w-full border-none shadow-none bg-transparent dark:bg-transparent p-0"
            />
          </SidebarGroupContent>

          <SidebarSeparator className="my-1 mx-0" />

        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarSeparator className="my-1 mx-0" />

        <div
          className={cn(
            "group relative flex items-center gap-3 rounded-lg border bg-background/40 px-2.5 py-2 shadow-xs",
            "hover:bg-background/70 transition-colors",
            isCollapsed && "justify-center px-2"
          )}
        >
          <div className={cn("relative shrink-0", isCollapsed ? "size-9" : "size-10")}>
            {me.avatarUrl ? (
              <img
                src={me.avatarUrl}
                alt="me"
                className="h-full w-full rounded-full object-cover border"
              />
            ) : (
              <div className="h-full w-full rounded-full border bg-muted flex items-center justify-center font-semibold">
                {initials}
              </div>
            )}

            <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border bg-emerald-500" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="truncate text-sm font-semibold leading-none">
                  {me.nickname || "게스트"}
                </div>
              </div>
              <div className="mt-1 truncate text-[11px] text-muted-foreground">
                {me.email || me.statusText || " "}
              </div>
            </div>
          )}

          <div className={cn("flex items-center gap-1", isCollapsed && "hidden")}>
            <button
              type="button"
              className="inline-flex size-8 items-center justify-center rounded-md border bg-background/60 hover:bg-accent transition-colors"
              aria-label="설정"
              onClick={() => {
                console.log("open settings");
              }}
            >
              <Settings className="size-4" />
            </button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

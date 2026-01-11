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
} from "@/components/ui/sidebar";
import CustomCalendar from "./custom-calendar";

const items = [
  { title: "대시보드", url: "/dashboard", icon: LayoutDashboard },
  { title: "사용자 관리", url: "#", icon: User },
  { title: "설정", url: "#", icon: Settings },
  { title: "홈", url: "#", icon: Home },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const mockHighlightDates = [
    new Date(2025, 11, 25), // 2025년 12월 25일
    new Date(2026, 0, 1),   // 2026년 1월 1일
    new Date(2026, 0, 15),
    new Date(2026, 2, 10),  // 2026년 3월 10일
  ];

  const handleDateSelect = (date: Date) => {
    console.log("선택된 날짜:", date);
  };

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarContent>
        <SidebarGroup>

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
                      {/* Google Sans Flex의 가변 두께 적용 가능 */}
                      <span className="font-sans font-medium">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>

            <SidebarGroupContent className={`transition-[margin,opacity] duration-200 ease-linear ${isCollapsed ? "opacity-0 scale-95 blur-sm invisible -translate-y-2 h-0" : "opacity-100 scale-100 blur-none visible translate-y-0"}`}>
              <CustomCalendar
                highlightDates={mockHighlightDates}
                onDateSelect={handleDateSelect}
                className="w-full min-w-[200px] border-none shadow-none bg-transparent dark:bg-transparent p-0"
              />
            </SidebarGroupContent>

          
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
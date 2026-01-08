
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
} from "@/components/ui/sidebar";

const items = [
  { title: "대시보드", url: "#", icon: LayoutDashboard },
  { title: "사용자 관리", url: "#", icon: User },
  { title: "설정", url: "#", icon: Settings },
  { title: "홈", url: "#", icon: Home },
];

export function AppSidebar() {
  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          {/* Noto Sans KR이 적용되어 한글이 깔끔하게 나옵니다 */}
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
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
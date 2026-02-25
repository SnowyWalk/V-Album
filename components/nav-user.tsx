"use client"

import {
    BadgeCheck,
    Bell,
    ChevronsUpDown,
    CreditCard, Ghost,
    LogOut, Moon,
    Sparkles, Sun,
} from "lucide-react"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import {toggleThemeWithTransition} from "@/components/ui/animated-theme-toggler";
import {useTheme} from "next-themes";
import {useMe} from "@/hooks/use-me";
import {useSession} from "next-auth/react";
import {Skeleton} from "@/components/ui/skeleton";

export function NavUser({
                            user,
                        }: {
    user: {
        name: string
        email: string
        avatar: string
    }
}) {
    const {isMobile} = useSidebar()

    const {resolvedTheme, setTheme} = useTheme()
    const isDark = resolvedTheme === "dark"

    const {status: sessionStatus} = useSession();
    const {data: me, isLoading: isMeLoading} = useMe()

    const UserProfile = () => {
        if (isMeLoading || sessionStatus == "loading")
            return (
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg" key="nav-user-avatar-skeleton">
                        <Skeleton className="h-full w-full" />
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                        <Skeleton className="h-[17.5px] w-24" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
            )
            
            if (!me)
                return (
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                        <Avatar className="h-8 w-8 rounded-lg" key="nav-user-avatar-guest">
                            <AvatarFallback><Ghost /></AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-medium">게스트</span>
                            <span className="truncate text-xs">비로그인 상태</span>
                        </div>
                    </div>
                );
            
            return (
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg" key="nav-user-avatar">
                        <AvatarImage src="https://avatars.githubusercontent.com/u/1624067?v=4" alt="User Avatar"/>
                        <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">{me?.nickname}</span>
                        <span className="truncate text-xs">{me?.userUuid}</span>
                    </div>
                </div>
            )
    }
    
    
    
    
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            id="nav-user-menu-trigger"
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            {UserProfile()}
                            <ChevronsUpDown className="ml-auto size-4"/>
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src={user.avatar} alt={user.name}/>
                                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">{user.name}</span>
                                    <span className="truncate text-xs">{user.email}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator/>
                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <Sparkles/>
                                Upgrade to Pro
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator/>
                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <BadgeCheck/>
                                Account
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <CreditCard/>
                                Billing
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Bell/>
                                Notifications
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={(event) => {
                                    void toggleThemeWithTransition(event.currentTarget as HTMLElement,
                                        {
                                            isDark: isDark,
                                            duration: 1000,
                                            cursorX: event.clientX,
                                            cursorY: event.clientY,
                                            onThemeChange: () => setTheme(isDark ? "light" : "dark")
                                        }
                                    )
                                }}
                            >
                                {isDark ? <Sun/> : <Moon/>}
                                테마 변경
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem>
                            <LogOut/>
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}

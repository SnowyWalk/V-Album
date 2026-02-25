"use client";

import {SidebarMenu, SidebarMenuButton, SidebarMenuItem} from "@/components/ui/sidebar";
import {AnimatedThemeToggler} from "@/components/ui/animated-theme-toggler";

export default function NavThemeToggle() {
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton>
                    <AnimatedThemeToggler/>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}

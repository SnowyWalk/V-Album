"use client"

import * as React from "react"
import {ChevronsUpDown, Plus} from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import {useEffect, useState} from "react";
import {Avatar, AvatarImage} from "@/components/ui/avatar";
import {useMe} from "@/hooks/use-me";
import {useMyGroups} from "@/hooks/use-my-groups";
import {Skeleton} from "@/components/ui/skeleton";


export function GroupSwitcher() {
    const {isMobile} = useSidebar()
    const [activeGroupUuid, setActiveGroupUuid] = useState<string | null>(() => {
        if (typeof window === "undefined") return null
        return localStorage.getItem("activeGroupUuid")
    })
    const {data: myGroups, isLoading} = useMyGroups()
    const activeGroup = myGroups?.groups.find(g => g.groupUuid === activeGroupUuid) ?? myGroups?.groups[0] ?? null
    console.log("activeGroup", activeGroup, "myGroups == null ?", myGroups == null, "myGroups:", myGroups )
    
    useEffect(() => {
        if (activeGroupUuid)
            localStorage.setItem("activeGroupUuid", activeGroupUuid)
    }, [activeGroupUuid])

    const ActiveGroup = () => {
        if (activeGroup == null || isLoading)
            return (
                <>
                    <Avatar className="rounded-full ring-1 ring-border" key="nav-group-avatar-skeleton">
                        <Skeleton className="h-full w-full"/>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                        <Skeleton className="h-[17.5px] w-24"/>
                        <Skeleton className="h-4 w-32"/>
                    </div>
                </>
            )

        return (
            <>
                <Avatar className="rounded-full ring-1 ring-border" key="nav-group-avatar">
                    <AvatarImage src={`/group-pics/${activeGroup.pic}.png`}/>
                    <Skeleton className="h-full w-full"/>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{activeGroup.name}</span>
                    <span className="truncate text-xs">{activeGroup.groupUuid}</span>
                </div>
            </>
        )
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            id="group-switcher-trigger"
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:ring-1 hover:ring-primary/20"
                        >
                            { ActiveGroup() }
                            <ChevronsUpDown className="ml-auto"/>
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        align="start"
                        side={isMobile ? "bottom" : "right"}
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="text-muted-foreground text-xs">
                            Groups
                        </DropdownMenuLabel>
                        {myGroups && myGroups.groups.map((group, index) => (
                            <DropdownMenuItem
                                key={group.name}
                                onClick={() => setActiveGroupUuid(group.groupUuid)}
                                className="gap-2 p-2"
                            >
                                <Avatar className="rounded-full ring-1 ring-border">
                                    <AvatarImage src={`/group-pics/${group.pic}.png`} className=""
                                                 alt="User Avatar"/>
                                </Avatar>
                                {group.name}
                                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem className="gap-2 p-2">
                            <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                                <Plus className="size-4"/>
                            </div>
                            <div className="text-muted-foreground font-medium">Add team</div>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}

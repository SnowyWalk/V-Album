"use client"

import * as React from "react"
import {Check, ChevronsUpDown, Plus} from "lucide-react"
import {useParams, useRouter} from "next/navigation";

import {
    DropdownMenu,
    DropdownMenuContent,
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
import {Avatar, AvatarImage} from "@/components/ui/avatar";
import {GroupDto, useMyGroups} from "@/hooks/use-my-groups";
import {Skeleton} from "@/components/ui/skeleton";
import {toast} from "sonner";
import {useMutation} from "@tanstack/react-query";
import {useMemo} from "react";

const dashboardGroupBanner: GroupDto = {
    groupUuid: "",
    name: "통합 피드",
    pic: "sample"
}

const RequestCreateGroup = async (): Promise<GroupDto> => {
    const groupName = "NewGroup"

    const result = await fetch("/api/group/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            groupName: groupName,
        }),
    })
    const ret = await result.json()

    type Response = {
        createdGroup: GroupDto
    }

    return (ret as Response).createdGroup
}

export function GroupSwitcher() {
    const {isMobile} = useSidebar()
    const router = useRouter()
    const params = useParams()
    const activeGroupUuid = params.groupUuid as string | undefined

    const {data: myGroups, isLoading, invalidateMyGroups} = useMyGroups()

    const createGroupMutation = useMutation<GroupDto>({
        mutationFn: RequestCreateGroup,
        onMutate: () => {
            toast("그룹 생성 중")
        },
        onSuccess: async (result: GroupDto) => {
            toast(`${result.name} 그룹 생성됨`)
            await invalidateMyGroups()
            router.push(`/group/${result.groupUuid}/feed`)
        }
    })

    const displayGroups = useMemo(() => {
        if (!myGroups) return [dashboardGroupBanner];
        return [dashboardGroupBanner, ...myGroups.groups];
    }, [myGroups]);

    const activeGroup = displayGroups.find(g => g.groupUuid === activeGroupUuid) ?? displayGroups[0] ?? null

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            id="group-switcher-trigger"
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:ring-1 hover:ring-primary/20"
                        >
                            <ActiveGroup activeGroup={activeGroup} isLoading={isLoading}/>
                            <ChevronsUpDown className="ml-auto"/>
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) rounded-lg min-w-68"
                        align="start"
                        side={isMobile ? "bottom" : "right"}
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="text-muted-foreground text-xs">
                            Dashboard
                        </DropdownMenuLabel>
                        {displayGroups && displayGroups.slice(0, 1).map((group, _) => (
                            <DropdownMenuItem
                                key={group.groupUuid}
                                onClick={() => router.push(group.groupUuid ? `/group/${group.groupUuid}/feed` : `/dashboard`)}
                                className="gap-2 p-2"
                            >
                                <Avatar className="rounded-full ring-1 ring-border">
                                    <AvatarImage src={`/group-pics/${group.pic}.png`}/>
                                </Avatar>
                                <span>{group.name}</span>
                                {group.groupUuid == activeGroupUuid && <Check className="h-4 w-4"/>}
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuLabel className="text-muted-foreground text-xs">
                            Groups
                        </DropdownMenuLabel>
                        {displayGroups && displayGroups.slice(1).map((group, _) => (
                            <DropdownMenuItem
                                key={group.groupUuid}
                                onClick={() => router.push(group.groupUuid ? `/group/${group.groupUuid}/feed` : `/dashboard`)}
                                className="gap-2 p-2"
                            >
                                <Avatar className="rounded-full ring-1 ring-border">
                                    <AvatarImage src={`/group-pics/${group.pic}.png`}/>
                                </Avatar>
                                <span>{group.name}</span>
                                {group.groupUuid == activeGroupUuid && <Check className="h-4 w-4"/>}
                            </DropdownMenuItem>
                        ))}

                        {
                            !displayGroups && Array.from({length: 3}).map((_, i) => (
                                <DropdownMenuItem className="gap-2 p-2" key={i}>
                                    <Avatar className="rounded-full ring-1 ring-border">
                                        <Skeleton className="h-full w-full"/>
                                    </Avatar>
                                    <Skeleton className="h-6 w-full"/>
                                </DropdownMenuItem>
                            ))
                        }
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem className="gap-2 p-2" onClick={() => createGroupMutation.mutate()}>
                            <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                                <Plus className="size-4"/>
                            </div>
                            <div className="text-muted-foreground font-medium">Add Group</div>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}

const ActiveGroup = ({activeGroup, isLoading}: { activeGroup: GroupDto | null, isLoading: boolean }) => {
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
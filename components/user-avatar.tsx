"use client";

import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Skeleton} from "@/components/ui/skeleton";
import {useUser} from "@/hooks/use-user";
import {Ghost, ImageOff} from "lucide-react";

export default function UserAvatar({userUuid}: { userUuid: string | null | undefined }) {
    const {data, isLoading} = useUser(userUuid)
    
    // 로딩 -> 스켈레톤
    if (isLoading) {
        return (
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-full" key="nav-user-avatar-skeleton">
                    <Skeleton className="h-full w-full"/>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                    <Skeleton className="h-[17.5px] w-24"/>
                    <Skeleton className="h-4 w-32"/>
                </div>
            </div>
        )
    }

    // 로드 실패 (웬만하면 발생 안 함)
    if (!data) {
        return (
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-full" key="nav-user-avatar-guest">
                    <AvatarFallback><Ghost strokeWidth={1.5}/></AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium text-muted-foreground">알 수 없는 유저 ({userUuid})</span>
                    <span className="truncate text-xs">정보 조회 실패</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-full" key="nav-user-avatar">
                <AvatarImage src={`/profile-pics/${data.pic}.png`} alt="User Avatar"/>
                <AvatarFallback className="rounded-full"><ImageOff/></AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{data.nickname}</span>
                <span className="truncate text-xs">{data.userUuid}</span>
            </div>
        </div>
    )
}
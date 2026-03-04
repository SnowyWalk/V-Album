import {useQuery, useQueryClient} from "@tanstack/react-query";
import {useCallback} from "react";
import {useSession} from "next-auth/react";

const queryKey = ["my-groups"]

export type GroupDto = {
    groupUuid: string
    name: string
    pic: string | null
}

export type MyGroupsDto = {
    groups: GroupDto[]
}

export function useMyGroups() {
    const { status } = useSession()
    const queryClient = useQueryClient()
    
    const resetMyGroups = useCallback(() => {
        queryClient.setQueryData(queryKey, null)
    }, [queryClient])

    const invalidateMyGroups = useCallback(async () => {
        await queryClient.invalidateQueries({ queryKey: queryKey })
    }, [queryClient])

    const query = useQuery({
        queryKey: queryKey,
        queryFn: fetchMyGroups,
        enabled: status === "authenticated",
    });

    return { ...query, resetMyGroups, invalidateMyGroups };
}

let callCount = 0
async function fetchMyGroups(): Promise<MyGroupsDto | null> {
    callCount++
    console.log("fetchMyGroups call#", callCount)
    const res = await fetch("/api/user/groups", {
        method: "GET",
        credentials: "include",
    })
    console.log("status:", res.status)
    
    // 로그인 안 된 상태
    if (res.status === 401) return null

    if (!res.ok) {
        throw new Error("Failed to fetch /api/user/groups")
    }

    // const text = await res.text()
    // console.log("raw body:", text)
    
    return (await res.json()) as MyGroupsDto
}
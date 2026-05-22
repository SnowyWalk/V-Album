import {useQuery, useQueryClient} from "@tanstack/react-query";
import {useCallback} from "react";
import {useSession} from "next-auth/react";
import {browserFetchClient} from "@/lib/api/browser-api-client";
import {Group} from "@/lib/api/schema-alias";

const queryKey = ["my-groups"]

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
        staleTime: 10 * 60 * 1000, // 10분
    });

    return { ...query, resetMyGroups, invalidateMyGroups };
}

async function fetchMyGroups(): Promise<Group[]> {   
    const { data, error } = await browserFetchClient.GET("/api/user/groups")
    
    if (error)
        return [];
    
    return data!;
}
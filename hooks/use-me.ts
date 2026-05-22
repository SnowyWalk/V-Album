import {useQuery, useQueryClient} from "@tanstack/react-query"
import {useSession} from "next-auth/react"
import {useCallback, useEffect} from "react"
import {browserFetchClient} from "@/lib/api/browser-api-client";
import {User} from "@/lib/api/schema-alias";

const meQueryKey = ["me"] as const

export function useMe() {
    const {status} = useSession()
    const queryClient = useQueryClient()
    
    
    const resetMe = useCallback(() => {
        queryClient.setQueryData(meQueryKey, null)
    }, [queryClient])

    const invalidateMe = useCallback(async () => {
        await queryClient.invalidateQueries({queryKey: meQueryKey})
    }, [queryClient])

    useEffect(() => {
        if (status === "unauthenticated") {
            resetMe()
        }
    }, [resetMe, status])

    const query = useQuery({
        queryKey: meQueryKey,
        queryFn: fetchMe,
        enabled: status === "authenticated",
        retry: (failureCount, error) => {
            if (error instanceof Error && error.message === "Not authenticated") {
                return false
            }
            return failureCount < 3
        }
    })

    return {
        ...query,
        resetMe,
        invalidateMe,
    }
}

async function fetchMe(): Promise<User | null> {
    const {data, error} = await browserFetchClient.GET("/api/user/me");
    if (error)
        return null;
    return data!;
}
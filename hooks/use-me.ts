import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { useCallback, useEffect } from "react"

const meQueryKey = ["me"] as const

export type MeDto = {
  userUuid: string
  nickname: string
  pic: string
}

export function useMe() {
  const { status } = useSession()
  const queryClient = useQueryClient()

  const resetMe = useCallback(() => {
    queryClient.setQueryData(meQueryKey, null)
  }, [queryClient])

  const invalidateMe = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: meQueryKey })
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

async function fetchMe(): Promise<MeDto | null> {
  const res = await fetch("/api/user/me", {
    method: "GET",
    credentials: "include",
  })

  if (res.status === 401) // GoogleSub 없음 || 해당 유저 없음
    throw new Error("Not authenticated")

  if (!res.ok) {
    throw new Error("Failed to fetch /api/user/me")
  }

  return (await res.json()) as MeDto
}

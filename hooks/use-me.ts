import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { useCallback, useEffect } from "react"

const meQueryKey = ["me"] as const

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
  })

  return {
    ...query,
    resetMe,
    invalidateMe,
  }
}

export type MeDto = {
  userUuid: string
  nickname: string
}

async function fetchMe(): Promise<MeDto | null> {
  const res = await fetch("/api/user/me", {
    method: "GET",
    credentials: "include",
  })

  // 로그인 안 된 상태
  if (res.status === 401) return null

  if (!res.ok) {
    throw new Error("Failed to fetch /api/user/me")
  }

  return (await res.json()) as MeDto
}

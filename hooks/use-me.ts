import { useQuery } from "@tanstack/react-query"

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
  })
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
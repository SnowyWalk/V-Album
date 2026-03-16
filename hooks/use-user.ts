import {useQuery} from "@tanstack/react-query";
import {UserDto} from "@/dto/user-dto";

async function fetchUser(uuid: string): Promise<UserDto> {
    const res = await fetch(`/api/users/avatar/${uuid}`);
    if (!res.ok) throw new Error("Failed to fetch user");
    return res.json();
}

export function useUser(uuid: string | null | undefined) {
    return useQuery({
        queryKey: ["user", uuid],
        queryFn: () => fetchUser(uuid!),
        enabled: !!uuid, // uuid 없으면 요청 안함
        staleTime: 10 * 60 * 1000, // 10분 캐시
    });
}
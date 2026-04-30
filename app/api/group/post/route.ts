import {NextRequest, NextResponse} from "next/server";
import {createServerApiClient} from "@/lib/api/server-api-client";

export async function POST(req: NextRequest) {
    const api = await createServerApiClient(req);
    if (!api) {
        return NextResponse.json(
            {error: "google sub missing in NextAuth JWT"},
            {status: 401}
        );
    }

    const incoming = await req.formData()
    const content = incoming.get("Content")

    if (typeof content !== "string" || !content.trim()) {
        return NextResponse.json(
            {error: "content is required"},
            {status: 400}
        )
    }

    const groupUuid = incoming.get("GroupUuid")
    if (typeof groupUuid !== "string" || !groupUuid.trim()) {
        return NextResponse.json(
            {error: "groupUuid is required"},
            {status: 400}
        )
    }

    const photos = incoming
        .getAll("Photos")
        .filter((value): value is File => value instanceof File);

    const {data, error} = await api.POST("/api/group/post", {
        body: {
            Content: content,
            GroupUuid: groupUuid,
            Photos: photos
        },
        bodySerializer(body) {
            const fd = new FormData();

            if (body.Content != null) fd.append("Content", body.Content);
            if (body.GroupUuid != null) fd.append("GroupUuid", body.GroupUuid);

            for (const file of body.Photos ?? []) {
                fd.append("Photos", file);
            }

            return fd;
        }
    })


    if (error) {
        return NextResponse.json({error}, {status: 400});
    }

    return NextResponse.json(data, {status: 200});
}

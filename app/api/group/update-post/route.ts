import {NextRequest, NextResponse} from "next/server";
import {createApiClient} from "@/lib/api/client";

export async function POST(req: NextRequest) {
    const api = await createApiClient(req);
    if (!api) {
        return NextResponse.json(
            {error: "google sub missing in NextAuth JWT"},
            {status: 401}
        );
    }

    const incoming = await req.formData();
    const content = incoming.get("content");

    if (typeof content !== "string" || !content.trim()) {
        return NextResponse.json(
            {error: "content is required"},
            {status: 400}
        );
    }

    const postUuid = incoming.get("postUuid");
    const photoOrder = incoming.get("photoOrder");

    if (typeof postUuid !== "string" || !postUuid) {
        return NextResponse.json(
            {error: "postUuid is required"},
            {status: 400}
        );
    }

    const newPhotoClientIds = incoming
        .getAll("newPhotoClientIds")
        .filter((value): value is string => typeof value === "string" && value.length > 0);

    const newPhotos = incoming
        .getAll("newPhotos")
        .filter((value): value is File => value instanceof File);

    const {data, error} = await api.POST("/api/group/update-post", {
        body: {
            PostUuid: postUuid,
            Content: content,
            PhotoOrder: typeof photoOrder === "string" ? photoOrder : undefined,
            NewPhotoClientIds: newPhotoClientIds as string[] | undefined,
            NewPhotos: newPhotos,
        },
        bodySerializer(body) {
            const fd = new FormData();

            fd.append("PostUuid", body.PostUuid!);

            if (body.Content != null) {
                fd.append("Content", body.Content);
            }

            if (body.PhotoOrder != null) {
                fd.append("PhotoOrder", body.PhotoOrder);
            }

            for (const clientId of newPhotoClientIds) {
                fd.append("NewPhotoClientIds", clientId);
            }

            for (const file of newPhotos) {
                fd.append("NewPhotos", file);
            }

            return fd;
        },
    });

    if (error) {
        return NextResponse.json({error}, {status: 400});
    }

    if (data == null) {
        return new NextResponse(null, {status: 200});
    }

    return NextResponse.json(data, {status: 200});
}

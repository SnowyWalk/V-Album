import {Card, CardContent, CardFooter, CardHeader} from "@/components/ui/card";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";
import {Heart, MessageCircle, MoreHorizontal, Share2} from "lucide-react";
import {cn} from "@/lib/utils";
import Image from "next/image";
import {PostDto} from "@/dto/post-dto";
import {useUser} from "@/hooks/use-user";
import {PhotoDto} from "@/dto/photo-dto";


export default function PostCard({post, onClickPhoto}: {
    post: PostDto,
    onClickPhoto: (photos: PhotoDto[], idx: number) => void
}) {
    const {data: userData, isLoading: isUserDataLoading} = useUser(post.userUuid)

    return (
        <Card key={post.postUuid} className="overflow-hidden border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between p-4">
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={`${userData?.pic}.png`}/>
                        <AvatarFallback>{userData?.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-semibold">{userData?.name}</p>
                        <p className="text-xs text-muted-foreground">{post.createdAt}</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4"/>
                </Button>
            </CardHeader>
            <CardContent className="p-0">
                <div className="px-4 pb-3">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{post.content}</p>
                </div>
                {post.photos.length > 0 && (
                    <div className={`grid gap-0.5 ${post.photos.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                        {post.photos.map((photo, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    "relative overflow-hidden bg-muted cursor-pointer",
                                    post.photos.length === 1 ? "aspect-video" : "aspect-square"
                                )}
                                onClick={() => onClickPhoto(post.photos, idx)}
                            >
                                <Image
                                    src={`/uploads/${post.groupUuid}/${post.postUuid}/${photo.photoUuid}${photo.ext}`}
                                    alt={`post-image-${idx}`}
                                    fill
                                    className="object-cover transition-transform hover:scale-105"
                                />
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex items-center justify-between p-2 px-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" className="h-9 gap-2 px-2 hover:text-red-500">
                        <Heart className="h-5 w-5"/>
                        <span className="text-xs font-medium">{12345}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-9 gap-2 px-2">
                        <MessageCircle className="h-5 w-5"/>
                        <span className="text-xs font-medium">{12345}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-9 px-2">
                        <Share2 className="h-5 w-5"/>
                    </Button>
                </div>
            </CardFooter>
        </Card>

    )

}
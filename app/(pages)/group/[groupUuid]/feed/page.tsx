"use client";

import {use} from "react";
import {CreatePostDialog} from "@/components/create-post-dialog";
import {Card, CardContent, CardHeader, CardFooter} from "@/components/ui/card";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";
import {Heart, MessageCircle, Share2, MoreHorizontal} from "lucide-react";
import Image from "next/image";
import {ImageViewer, PhotoItem} from "@/components/image-viewer";
import {useState} from "react";
import {cn} from "@/lib/utils";
import GroupFeed from "@/components/group-feed";

interface PageProps {
    params: Promise<{
        groupUuid: string;
    }>;
}

// 예시 데이터
const DUMMY_POSTS = [
    {
        id: "1",
        author: {
            name: "관리자",
            image: "https://github.com/shadcn.png",
        },
        content: "오늘 날씨가 너무 좋네요! 멋진 풍경 사진 공유합니다. ☀️",
        images: [
            {
                src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&w=1200&q=80", // Nature Landscape
                metadata: {
                    locationName: "요세미티 국립공원",
                    latitude: 37.8651,
                    longitude: -119.5383,
                    date: "2024-05-20"
                }
            }
        ],
        createdAt: "2시간 전",
        likes: 12,
        comments: 3,
    },
    {
        id: "2",
        author: {
            name: "관리자",
            image: "https://github.com/shadcn.png",
        },
        content: "맛있는 음식 사진입니다. 다들 식사 맛있게 하셨나요? 🍕",
        images: [
            {
                src: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&w=1200&q=80", // Pizza Landscape
                metadata: {
                    locationName: "이탈리안 레스토랑",
                    date: "2024-05-19"
                }
            },
            {
                src: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&w=1000&q=80", // Pizza Portrait
                metadata: {
                    locationName: "카페 테라스",
                    date: "2024-05-19"
                }
            }
        ],
        createdAt: "5시간 전",
        likes: 24,
        comments: 8,
    },
    {
        id: "3",
        author: {
            name: "관리자",
            image: "https://github.com/shadcn.png",
        },
        content: "다양한 비율과 메타데이터를 가진 사진들을 테스트해봅시다! 📸\n세로형(9:16), 가로형(16:9), 정사각형 사진들이 섞여있습니다.",
        images: [
            {
                src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&w=1000&q=80", // Portrait - Nature
                metadata: {
                    locationName: "신비로운 숲",
                    date: "2024-05-18"
                }
            },
            {
                src: "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&w=1000&q=80", // Portrait - Architecture
                metadata: {
                    locationName: "모던 건축물",
                    date: "2024-05-17"
                }
            },
            {
                src: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&w=1000&q=80", // Portrait - Tree
                metadata: {
                    locationName: "햇살 가득한 숲",
                    date: "2024-05-16"
                }
            },
            {
                src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&w=1600&q=80", // Landscape
                metadata: {
                    locationName: "안개 낀 산맥",
                    latitude: 46.8523,
                    longitude: 9.5307,
                    date: "2024-05-15"
                }
            },
            {
                src: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&w=1600&q=80", // Landscape - Lake
                metadata: {
                    locationName: "평화로운 호수",
                    date: "2024-05-16"
                }
            },
            {
                src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&w=1600&q=80", // Landscape - Mountains
                metadata: {
                    locationName: "알프스 산맥",
                    date: "2024-05-15"
                }
            },
            {
                src: "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?auto=format&w=1600&q=80", // Landscape - City
                metadata: {
                    locationName: "영국 런던",
                    date: "2024-05-14"
                }
            },
            {
                src: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&w=1000&q=80", // Square - Watch
                metadata: {
                    locationName: "화이트 스튜디오",
                    date: "2024-05-13"
                }
            },
            {
                src: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&w=1600&q=80", // Wide - Headphones
                metadata: {
                    locationName: "음악 작업실",
                    date: "2024-05-12"
                }
            },
            {
                src: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&w=1600&q=80", // Landscape - Camera
                metadata: {
                    locationName: "카메라 샵",
                    date: "2024-05-11"
                }
            },
            {
                src: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&w=1600&q=80", // Wide - Code
                metadata: {
                    locationName: "코딩 공간",
                    date: "2024-05-10"
                }
            },
            {
                src: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&w=1600&q=80", // Wide - Desk
                metadata: {
                    locationName: "워크스테이션",
                    date: "2024-05-09"
                }
            },
            {
                src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&w=1000&q=80", // Portrait - Nature
                metadata: {
                    locationName: "신비로운 숲",
                    date: "2024-05-18"
                }
            },
            {
                src: "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&w=1000&q=80", // Portrait - Architecture
                metadata: {
                    locationName: "모던 건축물",
                    date: "2024-05-17"
                }
            },
            {
                src: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&w=1000&q=80", // Portrait - Tree
                metadata: {
                    locationName: "햇살 가득한 숲",
                    date: "2024-05-16"
                }
            },
            {
                src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&w=1600&q=80", // Landscape
                metadata: {
                    locationName: "안개 낀 산맥",
                    latitude: 46.8523,
                    longitude: 9.5307,
                    date: "2024-05-15"
                }
            },
            {
                src: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&w=1600&q=80", // Landscape - Lake
                metadata: {
                    locationName: "평화로운 호수",
                    date: "2024-05-16"
                }
            },
            {
                src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&w=1600&q=80", // Landscape - Mountains
                metadata: {
                    locationName: "알프스 산맥",
                    date: "2024-05-15"
                }
            },
            {
                src: "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?auto=format&w=1600&q=80", // Landscape - City
                metadata: {
                    locationName: "영국 런던",
                    date: "2024-05-14"
                }
            },
            {
                src: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&w=1000&q=80", // Square - Watch
                metadata: {
                    locationName: "화이트 스튜디오",
                    date: "2024-05-13"
                }
            },
            {
                src: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&w=1600&q=80", // Wide - Headphones
                metadata: {
                    locationName: "음악 작업실",
                    date: "2024-05-12"
                }
            },
            {
                src: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&w=1600&q=80", // Landscape - Camera
                metadata: {
                    locationName: "카메라 샵",
                    date: "2024-05-11"
                }
            },
            {
                src: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&w=1600&q=80", // Wide - Code
                metadata: {
                    locationName: "코딩 공간",
                    date: "2024-05-10"
                }
            },
            {
                src: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&w=1600&q=80", // Wide - Desk
                metadata: {
                    locationName: "워크스테이션",
                    date: "2024-05-09"
                }
            },
            {
                src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&w=1000&q=80", // Portrait - Nature
                metadata: {
                    locationName: "신비로운 숲",
                    date: "2024-05-18"
                }
            },
            {
                src: "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&w=1000&q=80", // Portrait - Architecture
                metadata: {
                    locationName: "모던 건축물",
                    date: "2024-05-17"
                }
            },
            {
                src: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&w=1000&q=80", // Portrait - Tree
                metadata: {
                    locationName: "햇살 가득한 숲",
                    date: "2024-05-16"
                }
            },
            {
                src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&w=1600&q=80", // Landscape
                metadata: {
                    locationName: "안개 낀 산맥",
                    latitude: 46.8523,
                    longitude: 9.5307,
                    date: "2024-05-15"
                }
            },
            {
                src: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&w=1600&q=80", // Landscape - Lake
                metadata: {
                    locationName: "평화로운 호수",
                    date: "2024-05-16"
                }
            },
            {
                src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&w=1600&q=80", // Landscape - Mountains
                metadata: {
                    locationName: "알프스 산맥",
                    date: "2024-05-15"
                }
            },
            {
                src: "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?auto=format&w=1600&q=80", // Landscape - City
                metadata: {
                    locationName: "영국 런던",
                    date: "2024-05-14"
                }
            },
            {
                src: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&w=1000&q=80", // Square - Watch
                metadata: {
                    locationName: "화이트 스튜디오",
                    date: "2024-05-13"
                }
            },
            {
                src: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&w=1600&q=80", // Wide - Headphones
                metadata: {
                    locationName: "음악 작업실",
                    date: "2024-05-12"
                }
            },
            {
                src: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&w=1600&q=80", // Landscape - Camera
                metadata: {
                    locationName: "카메라 샵",
                    date: "2024-05-11"
                }
            },
            {
                src: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&w=1600&q=80", // Wide - Code
                metadata: {
                    locationName: "코딩 공간",
                    date: "2024-05-10"
                }
            },
            {
                src: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&w=1600&q=80", // Wide - Desk
                metadata: {
                    locationName: "워크스테이션",
                    date: "2024-05-09"
                }
            }
        ],
        createdAt: "어제",
        likes: 82,
        comments: 15,
    }
];

export default function GroupFeedPage({params}: PageProps) {
    const {groupUuid} = use(params);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [selectedPhotos, setSelectedPhotos] = useState<PhotoItem[]>([]);
    const [initialIndex, setInitialIndex] = useState(0);

    const handleImageClick = (photos: PhotoItem[], index: number) => {
        setSelectedPhotos(photos);
        setInitialIndex(index);
        setViewerOpen(true);
    };

    return (
        <div className="mx-auto max-w-2xl space-y-6 pb-20">
            <header className="sticky top-0 z-10 bg-background/80 py-4 backdrop-blur-md">
                <h1 className="text-2xl font-bold">그룹 피드</h1>
                <p className="text-sm text-muted-foreground">ID: {groupUuid}</p>
            </header>
            
            <GroupFeed groupUuid={groupUuid} />
            
            {/*<div className="flex flex-col gap-6 invisible w-0 h-0">*/}
            {/*    {DUMMY_POSTS.map((post) => (*/}
            {/*        <Card key={post.id} className="overflow-hidden border-none shadow-sm">*/}
            {/*            <CardHeader className="flex flex-row items-center justify-between p-4">*/}
            {/*                <div className="flex items-center gap-3">*/}
            {/*                    <Avatar className="h-9 w-9">*/}
            {/*                        <AvatarImage src={post.author.image}/>*/}
            {/*                        <AvatarFallback>{post.author.name[0]}</AvatarFallback>*/}
            {/*                    </Avatar>*/}
            {/*                    <div>*/}
            {/*                        <p className="text-sm font-semibold">{post.author.name}</p>*/}
            {/*                        <p className="text-xs text-muted-foreground">{post.createdAt}</p>*/}
            {/*                    </div>*/}
            {/*                </div>*/}
            {/*                <Button variant="ghost" size="icon" className="h-8 w-8">*/}
            {/*                    <MoreHorizontal className="h-4 w-4"/>*/}
            {/*                </Button>*/}
            {/*            </CardHeader>*/}
            {/*            <CardContent className="p-0">*/}
            {/*                <div className="px-4 pb-3">*/}
            {/*                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{post.content}</p>*/}
            {/*                </div>*/}
            {/*                {post.images.length > 0 && (*/}
            {/*                    <div*/}
            {/*                        className={`grid gap-0.5 ${post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>*/}
            {/*                        {post.images.map((image, idx) => (*/}
            {/*                            <div*/}
            {/*                                key={idx}*/}
            {/*                                className={cn(*/}
            {/*                                    "relative overflow-hidden bg-muted cursor-pointer",*/}
            {/*                                    post.images.length === 1 ? "aspect-video" : "aspect-square"*/}
            {/*                                )}*/}
            {/*                                onClick={() => handleImageClick(post.images, idx)}*/}
            {/*                            >*/}
            {/*                                <Image*/}
            {/*                                    src={image.src}*/}
            {/*                                    alt={`post-image-${idx}`}*/}
            {/*                                    fill*/}
            {/*                                    className="object-cover transition-transform hover:scale-105"*/}
            {/*                                />*/}
            {/*                            </div>*/}
            {/*                        ))}*/}
            {/*                    </div>*/}
            {/*                )}*/}
            {/*            </CardContent>*/}
            {/*            <CardFooter className="flex items-center justify-between p-2 px-4">*/}
            {/*                <div className="flex items-center gap-4">*/}
            {/*                    <Button variant="ghost" size="sm" className="h-9 gap-2 px-2 hover:text-red-500">*/}
            {/*                        <Heart className="h-5 w-5"/>*/}
            {/*                        <span className="text-xs font-medium">{post.likes}</span>*/}
            {/*                    </Button>*/}
            {/*                    <Button variant="ghost" size="sm" className="h-9 gap-2 px-2">*/}
            {/*                        <MessageCircle className="h-5 w-5"/>*/}
            {/*                        <span className="text-xs font-medium">{post.comments}</span>*/}
            {/*                    </Button>*/}
            {/*                    <Button variant="ghost" size="sm" className="h-9 px-2">*/}
            {/*                        <Share2 className="h-5 w-5"/>*/}
            {/*                    </Button>*/}
            {/*                </div>*/}
            {/*            </CardFooter>*/}
            {/*        </Card>*/}
            {/*    ))}*/}
            {/*</div>*/}

            <CreatePostDialog groupUuid={groupUuid}/>
            <ImageViewer
                photos={selectedPhotos}
                initialIndex={initialIndex}
                open={viewerOpen}
                onOpenChange={setViewerOpen}
            />
        </div>
    );
}

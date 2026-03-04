"use client";

import { use } from "react";
import { CreatePostDialog } from "@/components/create-post-dialog";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import Image from "next/image";

interface PageProps {
  params: Promise<{
    groupId: string;
  }>;
}

// 예시 데이터
const DUMMY_POSTS = [
  {
    id: "1",
    author: {
      name: "김철수",
      image: "https://github.com/shadcn.png",
    },
    content: "오늘 날씨가 너무 좋네요! 다같이 나들이 가고 싶어요. ☀️",
    images: ["https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"],
    createdAt: "2시간 전",
    likes: 12,
    comments: 3,
  },
  {
    id: "2",
    author: {
      name: "이영희",
      image: "https://github.com/shadcn.png",
    },
    content: "어제 먹은 맛있는 점심입니다. 다들 식사 맛있게 하셨나요? 🍕",
    images: [
        "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80"
    ],
    createdAt: "5시간 전",
    likes: 24,
    comments: 8,
  },
  {
    id: "3",
    author: {
      name: "박지민",
      image: "https://github.com/shadcn.png",
    },
    content: "우리 집 강아지 좀 보세요... 너무 귀엽지 않나요? 🐶",
    images: ["https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80"],
    createdAt: "어제",
    likes: 56,
    comments: 12,
  }
];

export default function GroupFeedPage({ params }: PageProps) {
  const { groupId } = use(params);

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-20">
      <header className="sticky top-0 z-10 bg-background/80 py-4 backdrop-blur-md">
        <h1 className="text-2xl font-bold">그룹 피드</h1>
        <p className="text-sm text-muted-foreground">ID: {groupId}</p>
      </header>

      <div className="flex flex-col gap-6">
        {DUMMY_POSTS.map((post) => (
          <Card key={post.id} className="overflow-hidden border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={post.author.image} />
                  <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">{post.author.name}</p>
                  <p className="text-xs text-muted-foreground">{post.createdAt}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="px-4 pb-3">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{post.content}</p>
              </div>
              {post.images.length > 0 && (
                <div className={`grid gap-0.5 ${post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {post.images.map((image, idx) => (
                    <div key={idx} className="relative aspect-square overflow-hidden bg-muted">
                      <Image
                        src={image}
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
                  <Heart className="h-5 w-5" />
                  <span className="text-xs font-medium">{post.likes}</span>
                </Button>
                <Button variant="ghost" size="sm" className="h-9 gap-2 px-2">
                  <MessageCircle className="h-5 w-5" />
                  <span className="text-xs font-medium">{post.comments}</span>
                </Button>
                <Button variant="ghost" size="sm" className="h-9 px-2">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      <CreatePostDialog />
    </div>
  );
}

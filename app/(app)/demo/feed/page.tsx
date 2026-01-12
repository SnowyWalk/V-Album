'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { PostDialog, type PostDialogPost } from '@/components/post-dialog'


type Person = { id: string; name: string }
type Post = {
    id: string
    author: string
    createdAt: string
    text: string
    people: Person[]
    photos: { id: string; label: string }[]
}

const PEOPLE: Person[] = [
    { id: 'p1', name: '세준' },
    { id: 'p2', name: '유리' },
    { id: 'p3', name: '민호' },
    { id: 'p4', name: '하나' },
]

const POSTS: Post[] = [
    {
        id: 'post-1',
        author: '세준',
        createdAt: '2026-01-11',
        text: '그룹 첫 업로드! 사진 여러 장 + 글 + 인물 태그 흐름 테스트.',
        people: [PEOPLE[0], PEOPLE[1]],
        photos: [
            { id: 'ph-1', label: 'A' },
            { id: 'ph-2', label: 'B' },
            { id: 'ph-3', label: 'C' },
        ],
    },
    {
        id: 'post-2',
        author: '유리',
        createdAt: '2026-01-10',
        text: '장소/인물 필터가 잘 먹는지 확인해보자.',
        people: [PEOPLE[1], PEOPLE[2], PEOPLE[3]],
        photos: [
            { id: 'ph-4', label: 'D' },
            { id: 'ph-5', label: 'E' },
        ],
    },
    {
        id: 'post-3',
        author: '민호',
        createdAt: '2026-01-08',
        text: '피드에서는 “맥락”이 중요한 듯. 텍스트가 더 눈에 들어오게.',
        people: [PEOPLE[2]],
        photos: [{ id: 'ph-6', label: 'F' }],
    },
]

function Thumb({
    label,
    className = '',
}: {
    label: string
    className?: string
}) {
    return (
        <div
            className={
                'relative overflow-hidden rounded-xl border bg-muted ' + className
            }
        >
            <div className="absolute inset-0 bg-gradient-to-br from-muted via-background to-muted" />
            <div className="relative flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                Photo {label}
            </div>
        </div>
    )
}

function PersonPill({ name, active }: { name: string; active: boolean }) {
    return (
        <Badge
            variant={active ? 'default' : 'secondary'}
            className="cursor-pointer select-none"
        >
            {name}
        </Badge>
    )
}

export default function DemoFeedPage() {
    const [query, setQuery] = React.useState('')
    const [selectedPersonId, setSelectedPersonId] = React.useState<string | null>(
        null
    )

    // ✅ 추가: 다이얼로그 상태
    const [dialogOpen, setDialogOpen] = React.useState(false)
    const [activePost, setActivePost] = React.useState<PostDialogPost | null>(null)

    const openPostDialog = (post: PostDialogPost) => {
        setActivePost(post) // ✅ 클릭한 게시글을 다이얼로그에 넣음
        setDialogOpen(true) // ✅ 오픈
    }


    const filtered = React.useMemo(() => {
        const q = query.trim().toLowerCase()
        return POSTS.filter((p) => {
            const matchesQuery =
                !q ||
                p.text.toLowerCase().includes(q) ||
                p.author.toLowerCase().includes(q)
            const matchesPerson =
                !selectedPersonId ||
                p.people.some((x) => x.id === selectedPersonId)
            return matchesQuery && matchesPerson
        })
    }, [query, selectedPersonId])

    return (
        <div className="mx-auto w-full max-w-5xl px-4 py-6">
            {/* 헤더 */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="text-2xl font-semibold">피드</div>
                    <div className="text-sm text-muted-foreground">
                        게시글 단위로 시간 흐름과 맥락을 보는 뷰
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="작성자/내용 검색…"
                        className="w-[220px]"
                    />
                    <Button variant="default">+ 올리기</Button>
                </div>
            </div>

            <Separator className="my-5" />

            {/* 인물 필터 */}
            <div className="flex flex-wrap items-center gap-2">
                <Badge
                    variant={selectedPersonId === null ? 'default' : 'secondary'}
                    className="cursor-pointer select-none"
                    onClick={() => setSelectedPersonId(null)}
                >
                    전체
                </Badge>
                {PEOPLE.map((p) => (
                    <div
                        key={p.id}
                        onClick={() =>
                            setSelectedPersonId((cur) => (cur === p.id ? null : p.id))
                        }
                    >
                        <PersonPill name={p.name} active={selectedPersonId === p.id} />
                    </div>
                ))}
            </div>

            <div className="mt-5 space-y-4">
                {filtered.map((post) => (
                    <Card key={post.id} className="overflow-hidden">
                        <CardHeader className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarFallback>
                                            {post.author.slice(0, 1).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="leading-tight">
                                        <div className="text-sm font-medium">{post.author}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {post.createdAt}
                                        </div>
                                    </div>
                                </div>

                                <Button variant="ghost" size="sm" onClick={() => openPostDialog(post)}>
                                    보기
                                </Button>
                            </div>

                            <div className="text-sm">{post.text}</div>

                            <div className="flex flex-wrap gap-2">
                                {post.people.map((p) => (
                                    <Badge key={p.id} variant="outline">
                                        👤 {p.name}
                                    </Badge>
                                ))}
                            </div>
                        </CardHeader>

                        <CardContent className="pb-5">
                            {/* 사진 프리뷰(대표 1 + 보조) */}
                            <div className="grid grid-cols-12 gap-2 cursor-pointer" onClick={() => openPostDialog(post)}>

                                <Thumb
                                    label={post.photos[0]?.label ?? '?'}
                                    className="col-span-12 h-56 sm:col-span-7"
                                />
                                <div className="col-span-12 grid grid-cols-2 gap-2 sm:col-span-5">
                                    <Thumb
                                        label={post.photos[1]?.label ?? '—'}
                                        className="h-[108px]"
                                    />

                                    <Thumb
                                        label={post.photos[2]?.label ?? '—'}
                                        className="h-[108px]"
                                    />

                                    <Thumb
                                        label={post.photos[3]?.label ?? '—'}
                                        className="h-[108px]"
                                    />

                                    <Thumb
                                        label={post.photos[4]?.label ?? '—'}
                                        className="h-[108px]"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {filtered.length === 0 && (
                    <div className="rounded-xl border p-10 text-center text-sm text-muted-foreground">
                        조건에 맞는 게시글이 없어.
                    </div>
                )}
            </div>

            <PostDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                post={activePost}
            />
        </div>
    )
}

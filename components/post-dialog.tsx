'use client'

import * as React from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'


export type PostDialogPerson = { id: string; name: string }
export type PostDialogPhoto = { id: string; label: string }
export type PostDialogPost = {
    id: string
    author: string
    createdAt: string
    text: string
    people: PostDialogPerson[]
    photos: PostDialogPhoto[]
}

type Comment = {
    id: string
    author: string
    text: string
    createdAt: string
}

function Thumb({
    label,
    className = '',
}: {
    label: string
    className?: string
}) {
    return (
        <div className={'relative overflow-hidden rounded-xl border bg-muted ' + className}>
            <div className="absolute inset-0 bg-gradient-to-br from-muted via-background to-muted" />
            <div className="relative flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                Photo {label}
            </div>
        </div>
    )
}

export function PostDialog({
    open,
    onOpenChange,
    post,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    post: PostDialogPost | null
}) {
    const [activeIndex, setActiveIndex] = React.useState(0)

    // 간단한 로컬 댓글(예시)
    const [comments, setComments] = React.useState<Comment[]>([
        { id: 'c1', author: '유리', text: '사진 분위기 좋다', createdAt: '2026-01-11' },
        { id: 'c2', author: '민호', text: '태그 흐름도 깔끔하네', createdAt: '2026-01-11' },
    ])
    const [commentText, setCommentText] = React.useState('')

    React.useEffect(() => {
        // ✅ post 바뀌면 첫 사진부터 보이도록 초기화
        setActiveIndex(0)
        setCommentText('')
    }, [post?.id])

    if (!post) return null

    const photos = post.photos ?? []
    const active = photos[activeIndex] ?? photos[0]

    const submitComment = () => {
        const t = commentText.trim()
        if (!t) return
        setComments((prev) => [
            ...prev,
            {
                id: `c-${Date.now()}`,
                author: '나', // TODO: 실제 로그인 유저로 교체
                text: t,
                createdAt: new Date().toISOString().slice(0, 10),
            },
        ])
        setCommentText('')
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {/* ✅ 인스타처럼 전체에 가깝게: max-w / height 크게 */}
            <DialogContent className="sm:max-w-[min(1600px,98vw)] max-w-[min(1600px,98vw)] w-full p-0 overflow-hidden">
                <VisuallyHidden>
                    <DialogTitle>{post.author}의 게시글</DialogTitle>
                </VisuallyHidden>

                <div className="grid h-[min(90vh,900px)] grid-cols-1 md:grid-cols-12">
                    {/* 좌측: 사진 영역 */}
                    <div className="md:col-span-7 border-b md:border-b-0 md:border-r bg-background">
                        <div className="p-3">
                            <Thumb label={active?.label ?? '—'} className="h-[60vh] md:h-[680px] rounded-none md:rounded-2xl" />
                        </div>

                        {/* 하단 썸네일 */}
                        <div className="px-3 pb-3">
                            <div className="flex gap-2 overflow-x-auto">
                                {photos.map((ph, idx) => {
                                    const isActive = idx === activeIndex
                                    return (
                                        <button
                                            key={ph.id}
                                            onClick={() => setActiveIndex(idx)}
                                            className={[
                                                'shrink-0 rounded-xl border transition',
                                                isActive ? 'ring-2 ring-foreground/30' : 'opacity-80 hover:opacity-100',
                                            ].join(' ')}
                                            aria-label={`photo-${idx + 1}`}
                                        >
                                            <Thumb label={ph.label} className="h-20 w-20 rounded-xl border-0" />
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* 우측: 정보/본문/댓글 */}
                    <div className="md:col-span-5 flex flex-col">
                        {/* 헤더 */}
                        <div className="p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarFallback>{post.author.slice(0, 1).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="leading-tight">
                                        <div className="text-sm font-medium">{post.author}</div>
                                        <div className="text-xs text-muted-foreground">{post.createdAt}</div>
                                    </div>
                                </div>

                                <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                                    닫기
                                </Button>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                                {post.people.map((p) => (
                                    <Badge key={p.id} variant="outline">
                                        👤 {p.name}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <Separator />

                        {/* 본문 */}
                        <div className="p-4">
                            <div className="text-sm whitespace-pre-wrap leading-relaxed">{post.text}</div>
                        </div>

                        <Separator />

                        {/* 댓글 리스트 (스크롤) */}
                        <div className="flex-1 overflow-auto p-4 space-y-3">
                            {comments.map((c) => (
                                <div key={c.id} className="text-sm">
                                    <span className="font-medium">{c.author}</span>{' '}
                                    <span className="text-muted-foreground text-xs">{c.createdAt}</span>
                                    <div className="mt-1">{c.text}</div>
                                </div>
                            ))}
                        </div>

                        <Separator />

                        {/* 댓글 입력 */}
                        <div className="p-3">
                            <div className="flex gap-2">
                                <Input
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="댓글 달기..."
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') submitComment()
                                    }}
                                />
                                <Button onClick={submitComment}>게시</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

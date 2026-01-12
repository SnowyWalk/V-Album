'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

type Photo = {
  id: string
  label: string
  createdAt: string
  people: string[] // 이름만
}

const PHOTOS: Photo[] = Array.from({ length: 32 }).map((_, i) => ({
  id: `photo-${i + 1}`,
  label: String.fromCharCode(65 + (i % 26)), // A~Z
  createdAt: `2026-01-${String(12 - (i % 10)).padStart(2, '0')}`,
  people:
    i % 3 === 0
      ? ['세준', '유리']
      : i % 3 === 1
        ? ['민호']
        : ['하나', '유리'],
}))

function PhotoTile({
  label,
  meta,
  onClick,
}: {
  label: string
  meta: string
  onClick?: () => void
}) {
  return (
    <Card
      onClick={onClick}
      className="group cursor-pointer overflow-hidden rounded-2xl"
    >
      <div className="relative aspect-square bg-muted">
        <div className="absolute inset-0 bg-gradient-to-br from-muted via-background to-muted" />
        <div className="relative flex h-full w-full items-center justify-center text-sm text-muted-foreground">
          Photo {label}
        </div>

        {/* Hover overlay */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
          <div className="m-2 rounded-xl border bg-background/80 p-2 backdrop-blur">
            <div className="text-xs text-muted-foreground">{meta}</div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default function DemoGalleryPage() {
  const [query, setQuery] = React.useState('')
  const [onlyPerson, setOnlyPerson] = React.useState<string | null>(null)

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return PHOTOS.filter((p) => {
      const matchesQuery =
        !q ||
        p.id.toLowerCase().includes(q) ||
        p.people.some((n) => n.toLowerCase().includes(q))
      const matchesPerson = !onlyPerson || p.people.includes(onlyPerson)
      return matchesQuery && matchesPerson
    })
  }, [query, onlyPerson])

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-2xl font-semibold">갤러리</div>
          <div className="text-sm text-muted-foreground">
            사진을 빠르게 훑고 찾는 뷰(텍스트 최소)
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="인물/키워드 검색…"
            className="w-[220px]"
          />
          <Button variant="secondary" onClick={() => setOnlyPerson(null)}>
            필터 초기화
          </Button>
        </div>
      </div>

      <Separator className="my-5" />

      <div className="flex flex-wrap gap-2">
        <div onClick={() => setOnlyPerson((cur) => (cur === '세준' ? null : '세준'))}>
          <Badge variant={onlyPerson === '세준' ? 'default' : 'secondary'} className="cursor-pointer">
            👤 세준
          </Badge>
        </div>
        <div onClick={() => setOnlyPerson((cur) => (cur === '유리' ? null : '유리'))}>
          <Badge variant={onlyPerson === '유리' ? 'default' : 'secondary'} className="cursor-pointer">
            👤 유리
          </Badge>
        </div>
        <div onClick={() => setOnlyPerson((cur) => (cur === '민호' ? null : '민호'))}>
          <Badge variant={onlyPerson === '민호' ? 'default' : 'secondary'} className="cursor-pointer">
            👤 민호
          </Badge>
        </div>
        <div onClick={() => setOnlyPerson((cur) => (cur === '하나' ? null : '하나'))}>
          <Badge variant={onlyPerson === '하나' ? 'default' : 'secondary'} className="cursor-pointer">
            👤 하나
          </Badge>
        </div>
      </div>

      {/* Grid */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {filtered.map((p) => (
          <PhotoTile
            key={p.id}
            label={p.label}
            meta={`${p.createdAt} · ${p.people.join(', ')}`}
            onClick={() => {
              // 여기서 라이트박스/상세로 연결하면 됨
              // alert(`${p.id}`)
            }}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-6 rounded-xl border p-10 text-center text-sm text-muted-foreground">
          조건에 맞는 사진이 없어.
        </div>
      )}
    </div>
  )
}

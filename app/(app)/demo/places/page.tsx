'use client'

import * as React from 'react'
import { Dialog } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

type Place = {
  id: string
  name: string
  subtitle: string
  photoCount: number
  peopleTop: string[]
  photos: { id: string; label: string; createdAt: string; people: string[] }[]
}

const PLACES: Place[] = [
  {
    id: 'tokyo',
    name: 'Tokyo',
    subtitle: '2026-01-11 ~ 2026-01-12',
    photoCount: 14,
    peopleTop: ['세준', '유리'],
    photos: Array.from({ length: 14 }).map((_, i) => ({
      id: `tokyo-${i}`,
      label: String.fromCharCode(65 + (i % 26)),
      createdAt: '2026-01-11',
      people: i % 2 === 0 ? ['세준', '유리'] : ['유리'],
    })),
  },
  {
    id: 'osaka',
    name: 'Osaka',
    subtitle: '2026-01-10',
    photoCount: 10,
    peopleTop: ['민호'],
    photos: Array.from({ length: 10 }).map((_, i) => ({
      id: `osaka-${i}`,
      label: String.fromCharCode(70 + (i % 20)),
      createdAt: '2026-01-10',
      people: i % 3 === 0 ? ['민호', '하나'] : ['민호'],
    })),
  },
  {
    id: 'cafe-a',
    name: 'Cafe A',
    subtitle: '2026-01-08',
    photoCount: 8,
    peopleTop: ['하나', '유리'],
    photos: Array.from({ length: 8 }).map((_, i) => ({
      id: `cafe-${i}`,
      label: String.fromCharCode(80 + (i % 10)),
      createdAt: '2026-01-08',
      people: i % 2 === 0 ? ['하나'] : ['하나', '유리'],
    })),
  },
]

function PhotoTile({
  label,
  meta,
}: {
  label: string
  meta: string
}) {
  return (
    <Card className="group overflow-hidden rounded-2xl">
      <div className="relative aspect-square bg-muted">
        <div className="absolute inset-0 bg-gradient-to-br from-muted via-background to-muted" />
        <div className="relative flex h-full w-full items-center justify-center text-sm text-muted-foreground">
          Photo {label}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
          <div className="m-2 rounded-xl border bg-background/80 p-2 backdrop-blur">
            <div className="text-xs text-muted-foreground">{meta}</div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default function DemoPlacesGalleryPage() {
  const [selectedPlaceId, setSelectedPlaceId] = React.useState(PLACES[0]?.id)
  const [query, setQuery] = React.useState('')

  const place = React.useMemo(
    () => PLACES.find((p) => p.id === selectedPlaceId) ?? PLACES[0],
    [selectedPlaceId]
  )

  const filteredPhotos = React.useMemo(() => {
    if (!place) return []
    const q = query.trim().toLowerCase()
    if (!q) return place.photos
    return place.photos.filter(
      (ph) =>
        ph.id.toLowerCase().includes(q) ||
        ph.people.some((n) => n.toLowerCase().includes(q))
    )
  }, [place, query])

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-2xl font-semibold">장소별 갤러리</div>
          <div className="text-sm text-muted-foreground">
            장소(카테고리) → 해당 장소의 사진 앨범을 보는 뷰
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="선택된 장소 내 검색(인물/키워드)…"
            className="w-[280px]"
          />
          <Button variant="default">+ 올리기</Button>
        </div>
      </div>

      <Separator className="my-5" />

      <div className="grid grid-cols-12 gap-4">
        {/* 좌측: 장소 리스트 */}
        <Card className="col-span-12 overflow-hidden rounded-2xl sm:col-span-4 lg:col-span-3">
          <div className="p-4">
            <div className="text-sm font-medium">장소</div>
            <div className="text-xs text-muted-foreground">
              카테고리를 선택하면 오른쪽 앨범이 바뀜
            </div>
          </div>
          <Separator />
          <ScrollArea className="h-[520px]">
            <div className="p-2">
              {PLACES.map((p) => {
                const active = p.id === selectedPlaceId
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlaceId(p.id)}
                    className={[
                      'w-full rounded-xl border p-3 text-left transition',
                      active
                        ? 'bg-muted'
                        : 'hover:bg-muted/60',
                    ].join(' ')}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {p.subtitle}
                        </div>
                      </div>
                      <Badge variant={active ? 'default' : 'secondary'}>
                        {p.photoCount}
                      </Badge>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-1">
                      {p.peopleTop.map((n) => (
                        <Badge key={n} variant="outline" className="text-[11px]">
                          👤 {n}
                        </Badge>
                      ))}
                    </div>
                  </button>
                )
              })}
            </div>
          </ScrollArea>
        </Card>

        {/* 우측: 선택된 장소 앨범 */}
        <div className="col-span-12 sm:col-span-8 lg:col-span-9">
          {/* 장소 헤더 카드 */}
          <Card className="overflow-hidden rounded-2xl">
            <div className="p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-lg font-semibold">{place?.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {place?.subtitle} · 사진 {place?.photoCount}장
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="secondary">정렬</Button>
                  <Button variant="secondary">필터</Button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {(place?.peopleTop ?? []).map((n) => (
                  <Badge key={n} variant="outline">
                    👤 {n}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>

          {/* 사진 그리드 */}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {filteredPhotos.map((ph) => (
              <PhotoTile
                key={ph.id}
                label={ph.label}
                meta={`${ph.createdAt} · ${ph.people.join(', ')}`}
              />
            ))}
          </div>

          {filteredPhotos.length === 0 && (
            <div className="mt-6 rounded-xl border p-10 text-center text-sm text-muted-foreground">
              이 장소에서 조건에 맞는 사진이 없어.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

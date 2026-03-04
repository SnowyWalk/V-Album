"use client";

import * as React from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, MapPin, Calendar, Users, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export interface PhotoMetadata {
  locationName?: string;
  latitude?: number;
  longitude?: number;
  date?: string;
  taggedPeople?: string[];
}

export interface PhotoItem {
  src: string;
  alt?: string;
  metadata?: PhotoMetadata;
}

interface ImageViewerProps {
  photos: PhotoItem[];
  initialIndex?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImageViewer({
  photos,
  initialIndex = 0,
  open,
  onOpenChange,
}: ImageViewerProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
  const [showMetadata, setShowMetadata] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  // 하이드레이션 오류 방지
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Carousel 인덱스 변경 감지
  React.useEffect(() => {
    if (!api) return;

    api.on("select", () => {
      setCurrentIndex(api.selectedScrollSnap());
    });
  }, [api]);

  // 외부에서 initialIndex가 변경될 때 대응 (필요 시)
  React.useEffect(() => {
    if (api && initialIndex !== undefined && open) {
      api.scrollTo(initialIndex, true);
      setCurrentIndex(initialIndex);
    }
  }, [api, initialIndex, open]);

  const goToPhoto = (index: number) => {
    api?.scrollTo(index);
  };

  const currentPhoto = photos[currentIndex];

  if (!mounted) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        showCloseButton={false}
        className="fixed inset-0 z-100 flex h-screen w-screen flex-col border-none bg-black p-0 text-white outline-none ring-0 duration-200 translate-x-0 translate-y-0 top-0 left-0 max-w-none sm:max-w-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-100 data-[state=closed]:zoom-out-100"
      >
        <DialogTitle className="sr-only">사진 뷰어</DialogTitle>
        <DialogDescription className="sr-only">
          {currentIndex + 1} / {photos.length} 번째 사진
        </DialogDescription>

        {/* Header - 닫기 버튼 */}
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
           <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 rounded-full h-10 w-10"
            onClick={() => setShowMetadata(!showMetadata)}
          >
            <Info className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 rounded-full h-10 w-10"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Main Viewport */}
        <div className="relative flex-1 w-full min-h-0 bg-black overflow-hidden flex items-center justify-center">
          <Carousel
            setApi={setApi}
            className="w-full h-full"
            opts={{
              startIndex: initialIndex,
              loop: true,
            }}
          >
            <CarouselContent className="ml-0">
              {photos.map((photo, index) => (
                <CarouselItem key={index} className="pl-0 relative">
                  <div className="absolute inset-0 flex items-center justify-center p-8 md:p-12 lg:p-16">
                    <div className="relative w-full h-full">
                      <Image
                        src={photo.src}
                        alt={photo.alt || `Photo ${index + 1}`}
                        fill
                        className="object-contain"
                        priority={index === initialIndex}
                        sizes="100vw"
                      />
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* 네비게이션 버튼 (데스크탑) */}
            <div className="hidden md:block">
               <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full h-12 w-12"
                onClick={() => api?.scrollPrev()}
                disabled={!api?.canScrollPrev()}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full h-12 w-12"
                onClick={() => api?.scrollNext()}
                disabled={!api?.canScrollNext()}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </div>
          </Carousel>

          {/* 메타데이터 오버레이 */}
          {showMetadata && currentPhoto?.metadata && (
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md bg-black/60 backdrop-blur-md p-4 rounded-lg border border-white/10 mx-4 transition-all animate-in fade-in slide-in-from-bottom-4">
              <div className="space-y-2 text-sm">
                {currentPhoto.metadata.locationName && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-400" />
                    <span>{currentPhoto.metadata.locationName}</span>
                    {currentPhoto.metadata.latitude && currentPhoto.metadata.longitude && (
                      <span className="text-xs text-muted-foreground">
                        ({currentPhoto.metadata.latitude.toFixed(4)}, {currentPhoto.metadata.longitude.toFixed(4)})
                      </span>
                    )}
                  </div>
                )}
                {currentPhoto.metadata.date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-green-400" />
                    <span>{currentPhoto.metadata.date}</span>
                  </div>
                )}
                {currentPhoto.metadata.taggedPeople && currentPhoto.metadata.taggedPeople.length > 0 && (
                  <div className="flex items-start gap-2">
                    <Users className="h-4 w-4 text-purple-400 mt-0.5" />
                    <div className="flex flex-wrap gap-1">
                      {currentPhoto.metadata.taggedPeople.map((person, idx) => (
                        <span key={idx} className="bg-white/10 px-2 py-0.5 rounded-full text-xs">
                          {person}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer - 썸네일 리스트 */}
        <div className="h-24 bg-black/40 backdrop-blur-sm border-t border-white/10 flex items-center shrink-0">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex w-max space-x-2 p-4 mx-auto">
              {photos.map((photo, index) => (
                <button
                  key={index}
                  onClick={() => goToPhoto(index)}
                  className={cn(
                    "relative h-16 w-16 overflow-hidden rounded-sm transition-all focus:outline-none ring-offset-black",
                    currentIndex === index 
                      ? "ring-2 ring-primary ring-offset-2 opacity-100 scale-110 z-10" 
                      : "opacity-50 hover:opacity-100"
                  )}
                >
                  <Image
                    src={photo.src}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="bg-white/20" />
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

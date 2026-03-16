"use client";

import * as React from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, MapPin, Calendar, Users, Info, Copy, Check } from "lucide-react";
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
import {cn, GetPhotoUrl} from "@/lib/utils";
import {PhotoDto} from "@/dto/photo-dto";

export interface PhotoMetadata {
  locationName?: string;
  latitude?: number;
  longitude?: number;
  date?: string;
  taggedPeople?: string[];
}

export interface PhotoItem {
  src: string;
  metadata?: PhotoMetadata;
}

interface ImageViewerProps {
  photoItems: PhotoItem[];
  initialIndex?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImageViewer({
  photoItems,
  initialIndex = 0,
  open,
  onOpenChange,
}: ImageViewerProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
  const [showMetadata, setShowMetadata] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [isCentered, setIsCentered] = React.useState(true);

  const [copiedText, setCopiedText] = React.useState<string | null>(null);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const CopyButton = ({ text }: { text: string }) => (
    <Button
      variant="ghost"
      size="icon"
      className="h-6 w-6 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
      onClick={() => copyToClipboard(text)}
    >
      {copiedText === text ? (
        <Check className="h-3 w-3 text-green-500" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </Button>
  );

  // 하이드레이션 오류 방지
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // 이미지 뷰어가 열릴 때 스크롤 잠금 및 업로드 버튼 위치 안정화
  React.useEffect(() => {
    if (open && mounted) {
      // 이미 body가 잠겨 있는지 확인 (다른 모달이 열려 있는 경우)
      const isAlreadyHidden = window.getComputedStyle(document.body).overflow === "hidden";
      
      // 뷰어가 열릴 때 body 스크롤 수동 잠금 (Layout Shift 방지용)
      const originalStyle = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      
      // 이미 잠겨 있다면 추가 조치를 하지 않고 복구 시에도 건드리지 않음
      if (isAlreadyHidden) {
        return;
      }

      // 스크롤바 너비 계산
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      document.body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      
      return () => {
        document.body.style.overflow = originalStyle;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [open, mounted]);

  // 썸네일 리스트가 중앙 정렬되어야 하는지 확인 (사진 개수가 적을 때)
  React.useEffect(() => {
    const checkCentered = () => {
      if (scrollRef.current) {
        const container = scrollRef.current;
        const innerContainer = container.firstElementChild as HTMLElement;
        if (innerContainer) {
          // scrollWidth가 offsetWidth보다 작거나 같으면 중앙 정렬 상태
          setIsCentered(innerContainer.scrollWidth <= container.offsetWidth + 1); // 소수점 오차 방지
        }
      }
    };
    
    if (mounted && open) {
      // 즉시 한 번 체크하고, 레이아웃이 완전히 잡힌 뒤 한 번 더 체크
      checkCentered();
      
      const observer = new ResizeObserver(() => {
        checkCentered();
      });
      
      if (scrollRef.current) {
        observer.observe(scrollRef.current);
      }
      
      const timer = setTimeout(checkCentered, 50); 
      return () => {
        clearTimeout(timer);
        observer.disconnect();
      };
    }
  }, [mounted, photoItems.length, open]); // open이 바뀔 때도 다시 체크

  // initialIndex가 변경될 때 currentIndex를 동기화
  React.useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex);
    }
  }, [open, initialIndex]);

  // Carousel 인덱스 변경 감지
  React.useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrentIndex(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    
    // 초기화 시점에도 한 번 실행
    onSelect();

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  // 키보드 방향키 이벤트 핸들링
  React.useEffect(() => {
    if (!open || !api) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        api.scrollPrev();
      } else if (e.key === "ArrowRight") {
        api.scrollNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, api]);

  // 외부에서 initialIndex가 변경될 때 대응 (필요 시)
  React.useEffect(() => {
    if (api && initialIndex !== undefined && open) {
      api.scrollTo(initialIndex, true);
      setCurrentIndex(initialIndex);
    }
  }, [api, open, initialIndex]);

  const goToPhoto = (index: number) => {
    api?.scrollTo(index);
  };

  const currentPhoto = photoItems[currentIndex];

  // 썸네일 드래그 스크롤 구현을 위한 Ref 및 로직
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [startX, setStartX] = React.useState(0);
  const [scrollLeft, setScrollLeft] = React.useState(0);
  const [hasMoved, setHasMoved] = React.useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setHasMoved(false);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // 스크롤 속도 조절
    if (Math.abs(walk) > 5) {
      setHasMoved(true);
    }
    const container = scrollRef.current;
    if (container) {
      // eslint-disable-next-line react-hooks/immutability
      container.scrollLeft = scrollLeft - walk;
    }
  };

  const handleThumbnailClick = (index: number) => {
    if (hasMoved) return; // 드래그 중이었다면 클릭 무시
    goToPhoto(index);
  };

  // 활성화된 썸네일을 중앙으로 스크롤 (최초 진입 시에만 실행)
  React.useEffect(() => {
    if (open && mounted) {
      const scrollThumbnailToCenter = () => {
        const container = scrollRef.current;
        if (!container) return;
        
        const flexContainer = container.firstElementChild as HTMLElement;
        if (!flexContainer) return;

        const isScrollable = flexContainer.scrollWidth > container.offsetWidth + 1;
        
        if (!isScrollable) {
          container.scrollTo({ left: 0, behavior: "instant" });
          return;
        }

        // 최초 진입 시에는 initialIndex를 기준으로 스크롤
        const targetThumbnail = container.querySelector(`button[data-index="${initialIndex}"]`) as HTMLElement;
        
        if (targetThumbnail) {
          const containerWidth = container.offsetWidth;
          const thumbnailWidth = targetThumbnail.offsetWidth;
          const thumbnailLeft = targetThumbnail.offsetLeft;
          
          const targetScrollLeft = thumbnailLeft - (containerWidth / 2) + (thumbnailWidth / 2);
          
          container.scrollTo({
            left: Math.max(0, targetScrollLeft),
            behavior: "instant"
          });
        }
      };

      // 즉시 실행 시도 (레이아웃이 잡혀있을 경우 대비)
      scrollThumbnailToCenter();
      
      // 다이얼로그 애니메이션 및 렌더링 완료를 위해 짧은 지연 시간으로 한 번 더 실행
      const timer = setTimeout(scrollThumbnailToCenter, 50);

      return () => clearTimeout(timer);
    }
  }, [open, mounted, initialIndex]); // currentIndex를 제거하여 진입 시에만 작동하도록 수정

  if (!mounted) return null;


  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogContent 
        showCloseButton={false}
        onPointerDownOutside={(e) => {
          // modal이 false일 때 외부 클릭으로 인해 부모 다이얼로그가 닫히는 것을 방지
          e.preventDefault();
        }}
        onInteractOutside={(e) => {
          // 상호작용이 외부로 전파되어 다른 UI가 닫히는 것을 방지
          e.preventDefault();
        }}
        onPointerDown={(e) => {
          // 뷰어 내부 클릭 시 이벤트가 부모 다이얼로그로 전파되어 닫히는 것을 방지
          e.stopPropagation();
        }}
        onClick={(e) => {
          // 뷰어 내부 클릭 시 이벤트가 부모 다이얼로그로 전파되어 닫히는 것을 방지
          e.stopPropagation();
        }}
        className="fixed inset-0 z-60 flex h-screen w-screen flex-col border-none bg-background/40 backdrop-blur-md p-0 text-foreground outline-none ring-0 duration-200 translate-x-0 translate-y-0 top-0 left-0 max-w-none sm:max-w-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0"
      >
        <DialogTitle className="sr-only">사진 뷰어</DialogTitle>
        <DialogDescription className="sr-only">
          {currentIndex + 1} / {photoItems.length} 번째 사진
        </DialogDescription>

        {/* Header - 닫기 버튼 */}
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
           <Button
            variant="ghost"
            size="icon"
            className="text-foreground hover:bg-accent rounded-full h-10 w-10"
            onClick={() => setShowMetadata(!showMetadata)}
          >
            <Info className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground hover:bg-accent rounded-full h-10 w-10"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Main Viewport */}
        <div className="relative flex-1 w-full min-h-0 bg-transparent overflow-hidden flex items-center justify-center select-none">
          <Carousel
            setApi={setApi}
            className="w-full h-full"
            opts={{
              startIndex: initialIndex,
              loop: true,
            }}
          >
            <CarouselContent className="ml-0">
              {photoItems.map((photoItem, index) => (
                <CarouselItem key={index} className="pl-0 relative">
                  <div className="absolute inset-0 flex items-center justify-center p-8 md:p-12 lg:p-16">
                    <div className="relative w-full h-full">
                      <Image
                        src={photoItem.src}
                        alt={``}
                        fill
                        className="object-contain"
                        priority={index === initialIndex}
                        sizes="100vw"
                        draggable={false}
                        unoptimized={true}
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
                className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground hover:bg-accent rounded-full h-12 w-12"
                onClick={() => api?.scrollPrev()}
                disabled={!api?.canScrollPrev()}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground hover:bg-accent rounded-full h-12 w-12"
                onClick={() => api?.scrollNext()}
                disabled={!api?.canScrollNext()}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </div>
          </Carousel>

          {/* 메타데이터 오버레이 */}
          {showMetadata && (
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md bg-background/60 backdrop-blur-md p-4 rounded-lg border border-border mx-4 z-50 group/metadata">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 rounded-full opacity-0 group-hover/metadata:opacity-100 transition-opacity"
                onClick={() => setShowMetadata(false)}
              >
                <X className="h-3 w-3" />
              </Button>
              <div className="space-y-2 text-sm text-foreground pr-4">
                {currentPhoto?.metadata ? (
                  <>
                    {currentPhoto.metadata.locationName && (
                      <div className="flex items-center gap-2 group">
                        <MapPin className="h-4 w-4 text-blue-400" />
                        <span>{currentPhoto.metadata.locationName}</span>
                        <CopyButton text={currentPhoto.metadata.locationName} />
                        {currentPhoto.metadata.latitude && currentPhoto.metadata.longitude && (
                          <div className="flex items-center gap-1 group/coord">
                            <span className="text-xs text-muted-foreground">
                              ({currentPhoto.metadata.latitude.toFixed(4)}, {currentPhoto.metadata.longitude.toFixed(4)})
                            </span>
                            <CopyButton text={`${currentPhoto.metadata.latitude}, ${currentPhoto.metadata.longitude}`} />
                          </div>
                        )}
                      </div>
                    )}
                    {currentPhoto.metadata.date && (
                      <div className="flex items-center gap-2 group">
                        <Calendar className="h-4 w-4 text-green-400" />
                        <span>{currentPhoto.metadata.date}</span>
                        <CopyButton text={currentPhoto.metadata.date} />
                      </div>
                    )}
                    {currentPhoto.metadata.taggedPeople && currentPhoto.metadata.taggedPeople.length > 0 && (
                      <div className="flex items-start gap-2">
                        <Users className="h-4 w-4 text-purple-400 mt-0.5" />
                        <div className="flex flex-wrap gap-1">
                          {currentPhoto.metadata.taggedPeople.map((person, idx) => (
                            <div key={idx} className="group relative">
                              <span className="bg-muted px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
                                {person}
                                <button
                                  onClick={() => copyToClipboard(person)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  {copiedText === person ? (
                                    <Check className="h-3 w-3 text-green-500" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </button>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4 text-muted-foreground gap-2">
                    <Info className="h-8 w-8 opacity-20" />
                    <p className="font-medium">메타데이터 없음</p>
                    <p className="text-xs opacity-70">이 사진에 대한 상세 정보가 존재하지 않습니다.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer - 썸네일 리스트 */}
        <div className="h-24 bg-background/40 backdrop-blur-sm border-t border-border flex items-center shrink-0 overflow-hidden select-none">
          <div 
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className={cn(
              "w-full h-full overflow-x-auto overflow-y-hidden whitespace-nowrap scrollbar-none cursor-default",
              isDragging && "cursor-grabbing"
            )}
          >
            <div className={cn(
              "flex h-full min-w-full space-x-2 p-4 items-center",
              isCentered ? "justify-center" : "justify-start"
            )}>
              {photoItems.map((photoItem, index) => (
                <button
                  key={index}
                  onClick={() => handleThumbnailClick(index)}
                  draggable={false}
                  data-index={index}
                  className={cn(
                    "relative h-16 w-28 overflow-hidden rounded-sm focus:outline-none ring-offset-background shrink-0",
                    currentIndex === index 
                      ? "ring-2 ring-primary ring-offset-2 opacity-100 scale-110 z-10" 
                      : "opacity-60 hover:opacity-100"
                  )}
                >
                  <div className="absolute inset-0 bg-accent/10 pointer-events-none" />
                  <Image
                    src={photoItem.src}
                    alt={``}
                    fill
                    className="object-contain pointer-events-none"
                    draggable={false}
                    unoptimized={true}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

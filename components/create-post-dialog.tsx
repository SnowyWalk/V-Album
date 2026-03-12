"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { Plus, Image as ImageIcon, X, Maximize2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { ImageViewer, PhotoItem } from "@/components/image-viewer";
import {useQueryClient} from "@tanstack/react-query";

export function CreatePostDialog({ groupUuid }: { groupUuid: string }) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [content, setContent] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const photoItems = useMemo<PhotoItem[]>(() => {
    return previews.map((src, index) => ({
      src,
      alt: `preview-${index}`,
    }));
  }, [previews]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      addFiles(files);
    }
  };

  const addFiles = (files: File[]) => {
    setSelectedImages((prev) => [...prev, ...files]);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index]);
      return newPreviews.filter((_, i) => i !== index);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const files = Array.from(e.dataTransfer.files);
      addFiles(files);
    }
  };

  const handleSubmit = async () => {
    if (isUploading) return;
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("groupUuid", groupUuid);
      selectedImages.forEach((file) => {
        formData.append("photos", file);
      });
      
      const response = await fetch("/api/group/post", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("업로드 실패");
      }

      // 상태 초기화 및 닫기
      setContent("");
      setSelectedImages([]);
      setPreviews([]);
      setViewerOpen(false);
      setOpen(false);
      await queryClient.resetQueries({ queryKey: ["feed", groupUuid] });
    } catch (error) {
      console.error("포스트 제출 오류:", error);
      alert("업로드 중 오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  const openViewer = (index: number) => {
    setViewerIndex(index);
    setViewerOpen(true);
  };

  if (!mounted) {
    return (
      <Button className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg !transition-none !duration-0 active:scale-95 z-40 transform-none">
        <Plus className="h-8 w-8" />
      </Button>
    );
  }

  return (
    <>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg !transition-none !duration-0 active:scale-95 z-40 transform-none">
          <Plus className="h-8 w-8" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>새 게시물 만들기</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 transition-colors hover:border-muted-foreground/50"
          >
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageChange}
            />
            {previews.length === 0 ? (
              <div
                className="flex flex-col items-center gap-2 text-muted-foreground w-full h-full py-10"
              >
                <ImageIcon className="h-10 w-10" />
                <p>사진을 드래그하거나 클릭하여 업로드</p>
              </div>
            ) : (
              <div className="grid w-full grid-cols-3 gap-2 p-2">
                {previews.map((preview, index) => (
                  <div key={index} className="group relative aspect-square overflow-hidden rounded-md border bg-muted">
                    <Image
                      src={preview}
                      alt={`preview-${index}`}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-white hover:bg-white/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          openViewer(index);
                        }}
                      >
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(index);
                      }}
                      className="absolute right-1 top-1 z-10 rounded-full bg-black/60 p-1 text-white shadow-sm transition-colors hover:bg-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="flex aspect-square flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-muted-foreground/25 transition-colors hover:border-muted-foreground/50 hover:bg-accent"
                >
                  <Plus className="h-6 w-6 text-muted-foreground" />
                  <span className="text-[10px] font-medium text-muted-foreground">추가</span>
                </button>
              </div>
            )}
          </div>
          <Textarea
            placeholder="이 사진들에 대해 설명해주세요..."
            className="min-h-[100px] resize-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={(!content && selectedImages.length === 0) || isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                업로드 중...
              </>
            ) : (
              "공유하기"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    {previews.length > 0 && (
      <ImageViewer
        photos={photoItems}
        initialIndex={viewerIndex}
        open={viewerOpen}
        onOpenChange={setViewerOpen}
      />
    )}
    </>
  );
}

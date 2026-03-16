import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {PostDto} from "@/dto/post-dto";
import {PhotoDto} from "@/dto/photo-dto";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function GetPhotoUrl(groupUuid: string, postUuid: string, photoUuid: string, format: string): string;
export function GetPhotoUrl(post: PostDto, photo: PhotoDto): string;

export function GetPhotoUrl(
    a: string | PostDto,
    b: string | PhotoDto,
    c?: string,
    d?: string
): string {
  if (typeof a === "string") {
    return `/uploads/${a}/${b}/${c}${d}`;
  }

  const post = a;
  const photo = b as PhotoDto;

  return `/uploads/${post.groupUuid}/${post.postUuid}/${photo.photoUuid}${photo.format}`;
}
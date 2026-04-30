import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {Photo, Post} from "@/lib/api/schema-alias";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function GetPhotoUrl(groupUuid: string, postUuid: string, photoUuid: string, format: string | null): string;
export function GetPhotoUrl(post: Post, photo: Photo): string;

export function GetPhotoUrl(
    a: string | Post,
    b: string | Photo,
    c?: string,
    d?: string | null
): string {
  if (typeof a === "string") {
    return `/uploads/${a}/${b}/${c}${d}`;
  }

  const post = a;
  const photo = b as Photo;

  return `/uploads/${post.groupUuid}/${post.postUuid}/${photo.photoUuid}${photo.format}`;
}

export const formatCount = (n: number) =>
    n >= 1_000 ? `${(n / 1_000).toFixed(1)}k` : String(n);
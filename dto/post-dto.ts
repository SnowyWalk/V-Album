import {PhotoDto} from "@/dto/photo-dto";

export interface PostDto {
    postUuid: string;
    groupUuid: string;
    userUuid: string;
    content: string | null;
    createdAt: string;
    
    photos: PhotoDto[];
}
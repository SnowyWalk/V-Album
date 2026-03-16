import {PostDto} from "@/dto/post-dto";
import {PhotoDto} from "@/dto/photo-dto";

export interface FeedItemDto {
    post: PostDto;
    photos: PhotoDto[] | null;
}

export type FeedItemsDto = FeedItemDto[];
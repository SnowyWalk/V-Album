import type { components } from "@/lib/api/schema";

type schema = components["schemas"];

// Request
export type CreateRequest = schema["CreateRequest"];
export type DeleteCommentRequest = schema["DeleteCommentRequest"];
export type DeleteLikeRequest = schema["DeleteLikeRequest"];
export type DeletePostRequest = schema["DeletePostRequest"];
export type GoogleLoginRequest = schema["GoogleLoginRequest"];
export type PutCommentRequest = schema["PutCommentRequest"];
export type PutLikeRequest = schema["PutLikeRequest"];

// Response
export type CreateResponse = schema["CreateResponse"];
export type FeedResponse = schema["FeedResponse"];
export type GetGroupsResponse = schema["GetGroupsResponse"];
export type GoogleLoginResponse = schema["GoogleLoginResponse"];
export type LikeResponse = schema["LikeResponse"];
export type PostResponse = schema["PostResponse"];

// Etc
export type Comment = schema["Comment"];
export type FeedCursor = schema["FeedCursor"];
export type FeedItem = schema["FeedItem"];
export type Group = schema["Group"];
export type IFormFile = schema["IFormFile"];
export type Photo = schema["Photo"];
export type Post = schema["Post"];
export type UserDto = schema["UserDto"];


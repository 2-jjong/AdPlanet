// src/services/dto/poster.request.ts

export const PosterStyle = {
  SIMPLE: "SIMPLE",
  MONO: "MONO",
} as const;

export type PosterStyle = (typeof PosterStyle)[keyof typeof PosterStyle];

export interface PosterGroupListQuery {
  order?: 'LATEST' | 'OLDEST';
  tagId?: number;
}

export interface CreatePosterJsonRequest {
  groupId: number;
  title: string;
  content?: string;
  prompt: string;
}

export interface CreatePosterRequest {
  style?: PosterStyle;
  request: CreatePosterJsonRequest; // JSON 문자열로 FormData 'request' 필드에 담김
  sketchImage?: File | null;
  productImage?: File | null;
  modelImage?: File | null;
  skeletonImage?: File | null;
  previousImage?: File | null;
}

export interface AssignPosterTagsRequest {
  groupId: number;
  tagId: number[];
}




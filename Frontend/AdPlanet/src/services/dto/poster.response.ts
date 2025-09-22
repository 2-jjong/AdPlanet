// src/services/dto/poster.response.ts

export interface Poster {
  posterId: number;
  imgUrl: string;
  groupId?: number;
}

export interface PosterTag {
  tagId: number;
  tagName: string;
}

export interface PosterDetail {
  posterId: number;
  groupId: number;
  imgUrl: string;
  prompt: string;
}

export interface PosterCopy {
  content: string;
}

/** 포스터 그룹 목록 아이템 */
export interface PosterGroupItem {
  posterGroupId: number;
  imgUrl: string;
  title: string;
  content: string;
  createdAt: string; // ISO date string
}

export interface PosterGroupDetailPosterItem {
  posterId: number;
  imgUrl: string;
  prompt?: string; 

}

export interface PosterGroupDetail {
  posterGroupId: number;
  imgUrl: string;
  title: string;
  content: string;
  createdAt: string; // ISO date string
  history: PosterGroupDetailPosterItem[];
}

export interface PosterJobResult {
  posterId: number;
  groupId: number;
  imgUrl: string;
  prompt?: string;
}

export type PosterJobStatusType = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | string;

export interface PosterJobStatus {
  jobId: string;
  status: PosterJobStatusType;
  createdAt: string; // ISO date string
  result?: PosterJobResult | null;
}



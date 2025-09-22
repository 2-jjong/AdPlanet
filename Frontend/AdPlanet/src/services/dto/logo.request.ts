// src/services/dto/logo.request.ts

// 목록 조회 쿼리
export interface LogoListQuery {
  order?: "LATEST" | "OLDEST";
  tagId?: number;
}

export const LogoStyle = {
  SIMPLE: "SIMPLE",
  MONO: "MONO",
} as const;

export type LogoStyle = (typeof LogoStyle)[keyof typeof LogoStyle];

export interface CreateLogoRequest {
  title: string;
  content?: string;
  prompt: string;
  style?: LogoStyle;
}

export interface AddLogoTag{
  name:string
}

export interface AssignLogoTagsRequest {
  tagIds: number[];
}

export interface LogoDownloadRequest{
  logoId:number,
  format:string
}

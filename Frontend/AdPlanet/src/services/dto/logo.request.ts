// src/services/dto/logo.request.ts

// 목록 조회 쿼리
export interface LogoListQuery {
  order?: "NEWEST" | "OLDEST";
  tagIds?: number[]; // 다중 태그 지원
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

export interface AssignLogoTagsRequest {
  tagIds: number[];
}


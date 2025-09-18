import apiClient from "../../services/apiClient";
import type { ApiResponse } from "../../types/api";

/* ─────────────────────────────────────────────────────────────
   서버 스키마 (DTO)
───────────────────────────────────────────────────────────── */

// 목록
export interface LogoListItem {
  logoId: number;
  name: string;
  slogan: string;
  imgUrl: string;
}

// 목록 조회 쿼리
export interface LogoListQuery {
  order?: "LATEST" | "OLDEST";
  tagId?: number;
}

// 상세
export interface LogoDetail {
  name: string;
  slogan: string;
  imgUrl: string;
  prompt?: string;
}

// 태그 목록
export interface LogoTag {
  tagId: number;
  tagName: string;
}

// CI 가이드라인
export interface CiGuideline {
  id?: number;
  logoId?: number;

  basicLogo?: string;
  minSize?: string;
  marginRule?: string;
  backgroundRule?: string;
  prohibitionRule?: string;

  primaryColor?: string;
  secondaryColor?: string;
  neutralColor?: string;

  primaryGuide?: string;
  secondaryGuide?: string;
  neutralGuide?: string;
}

/* ─────────────────────────────────────────────────────────────
   API 호출 (ApiResponse<T> 그대로 반환)
   - 가공/매핑은 화면단에서 필요 시 처리.
───────────────────────────────────────────────────────────── */

export async function fetchLogoList(
  params: LogoListQuery
): Promise<ApiResponse<LogoListItem[]>> {
  const { data } = await apiClient.get<ApiResponse<LogoListItem[]>>(
    "/api/logos",
    { params }
  );
  return data;
}

export async function fetchLogoDetailById(
  logoId: number
): Promise<ApiResponse<LogoDetail>> {
  const { data } = await apiClient.get<ApiResponse<LogoDetail>>(
    `/api/logos/${logoId}`
  );
  return data;
}

export async function fetchCiGuidelineByLogoId(
  logoId: number
): Promise<ApiResponse<CiGuideline>> {
  const { data } = await apiClient.get<ApiResponse<CiGuideline>>(
    `/api/logos/${logoId}/ci-guideline`
  );
  return data;
}

export async function createCiGuideline(
  logoId: number
): Promise<ApiResponse<unknown>> {
  const { data } = await apiClient.post<ApiResponse<unknown>>(
    `/api/logos/${logoId}/ci-guideline`
  );
  return data;
}

export async function fetchLogoTags(): Promise<ApiResponse<LogoTag[]>> {
  const { data } = await apiClient.get<ApiResponse<LogoTag[]>>(
    "/api/logos/tags"
  );
  return data;
}

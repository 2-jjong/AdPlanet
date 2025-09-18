import apiClient from "../../services/apiClient";
import type { ApiResponse } from "../../types/api";


// 목록
export interface LogoListItemDto {
  logoId: number; name: string; slogan: string; imgUrl: string;
}

// 목록 조회 쿼리 (최신순, 오래된순, 태그ID)
export interface LogoListQueryDto { order?: "LATEST" | "OLDEST"; tagId?: number; }

// 상세
export interface LogoDetailDto {
  name: string; slogan: string; imgUrl: string; prompt?: string;
}

// 태그 목록
export interface LogoTagDto {
  tagId: number; 
  tagName: string;
}

const ok = (code?: string) => code === "S0000";
const ensureHex = (s?: string) => (s ? (s.startsWith("#") ? s : `#${s}`) : undefined);

// 절대 URL로 변환 (이미 절대면 그대로, 빈값이면 빈값, 상대면 baseURL 기준으로 절대)
export const toAbsolute = (p: string) => {
  if (!p || /^https?:\/\//i.test(p)) return p;
  const base = (apiClient as any)?.defaults?.baseURL || "";
  return base ? new URL(p.startsWith("/") ? p : `/${p}`, base).toString() : p;
};

// API 호출
export async function fetchLogoListDto(params: LogoListQueryDto) {
  const { data } = await apiClient.get<ApiResponse<LogoListItemDto[]>>("/api/logos", { params });
  if (data.code !== "S0000" || !Array.isArray(data.data)) {
    throw new Error(data.message || `API ${data.code}`);
  }
  return data.data;
}

// 로고 상세 정보
export async function fetchLogoDetailDto(logoId: number) {
  const { data } = await apiClient.get<ApiResponse<LogoDetailDto>>(`/api/logos/${logoId}`);
  if (!ok(data?.code)) throw new Error(data?.message || `API ${data?.code}`);
  return data.data;
}

// CI 가이드라인
export interface CiGuidelineDto {
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

// CI 가이드라인 정보
export async function fetchCiGuidelineDto(logoId: number) {
  const { data } = await apiClient.get<ApiResponse<CiGuidelineDto>>(`/api/logos/${logoId}/ci-guideline`);
  if (!ok(data?.code)) throw new Error(data?.message || `API ${data?.code}`);
  return data.data || {};
}

// CI 가이드라인 생성 요청
export async function createCiGuidelineDto(logoId: number) {
  const { data } = await apiClient.post<ApiResponse<unknown>>(
    `/api/logos/${logoId}/ci-guideline`
  );
  if (!ok(data?.code)) throw new Error(data?.message || `API ${data?.code}`);
  return true;
}



// 로고 카테고리 태그 목록
export async function fetchLogoTagsDto() {
  const { data } = await apiClient.get<ApiResponse<LogoTagDto[]>>("/api/logos/tags");
  if (!ok(data?.code)) throw new Error(data?.message || `API ${data?.code}`);
  return data.data;
}

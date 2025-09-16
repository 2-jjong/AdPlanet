import apiClient from "../../services/apiClient";
import type { ApiResponse } from "../../types/api";

// 목록
export interface LogoListItemDto {
  logoId: number; name: string; slogan: string; imgUrl: string;
}
export interface LogoListQueryDto { order?: "LATEST" | "OLDEST"; tagId?: number; }

// 상세
export interface LogoDetailDto {
  name: string; slogan: string; imgUrl: string; prompt?: string;
}

// CI 가이드라인
export interface CiGuidelineDto {
  logoGuide?: string;      // markdown 텍스트
  primaryColor?: string;   // "3D9FD8" (샾 없음)
  secondaryColor?: string; // "46A9DB"
  neutralColor?: string;   // "87DEDA"
  primaryGuide?: string;   // 상세 텍스트
  secondaryGuide?: string;
  neutralGuide?: string;
}

// 태그 목록
export interface LogoTagDto { tagId: number; tagName: string; }

const ok = (code?: string) => code === "S0000";
const ensureHex = (s?: string) => (s ? (s.startsWith("#") ? s : `#${s}`) : undefined);

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

// CI 가이드라인 정보
export async function fetchCiGuidelineDto(logoId: number) {
  const { data } = await apiClient.get<ApiResponse<CiGuidelineDto>>(`/api/logos/${logoId}/ci-guideline`);
  if (!ok(data?.code)) throw new Error(data?.message || `API ${data?.code}`);

  // 색상은 # 보정해서 넘겨주면 서비스에서 그대로 사용 가능
  const d = data.data;

  return {
    ...d,
    primaryColor: ensureHex(d.primaryColor),
    secondaryColor: ensureHex(d.secondaryColor),
    neutralColor: ensureHex(d.neutralColor),
  } as CiGuidelineDto;
}

// 로고 카테고리 태그 목록
export async function fetchLogoTagsDto() {
  const { data } = await apiClient.get<ApiResponse<LogoTagDto[]>>("/api/logos/tags");
  if (!ok(data?.code)) throw new Error(data?.message || `API ${data?.code}`);
  return data.data;
}

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
  const res = await apiClient.get<ApiResponse<LogoListItemDto[]>>("/api/logos", {
    params,
    headers: { "Cache-Control": "no-store" }, // 개발 캐시 회피
  });

  const body: any = res.data;

  // 1) 배열만 오는 경우(프록시/스켈레톤)
  if (Array.isArray(body)) return body as LogoListItemDto[];

  // 2) 공통 래퍼 { code?, data, message? }
  if (body && typeof body === "object" && "data" in body) {
    // 실패코드가 명시된 경우만 에러로 간주
    if (typeof body.code === "string" && body.code.startsWith("E")) {
      throw new Error(body.message || `API ${body.code}`);
    }
    const d = body.data;
    if (Array.isArray(d)) return d as LogoListItemDto[];
    if (d == null) return [];                    // 👈 data가 null/undefined면 빈 리스트로 처리
  }

  // 3) 그 외: 미리보기 포함해서 디버깅
  const preview = (() => { try { return JSON.stringify(body).slice(0,200); } catch { return String(body).slice(0,200);} })();
  throw new Error(`Unexpected logos shape: ${preview}`);
}



export async function fetchLogoDetailDto(logoId: number) {
  const { data } = await apiClient.get<ApiResponse<LogoDetailDto>>(`/api/logos/${logoId}`);
  if (!ok(data?.code)) throw new Error(data?.message || `API ${data?.code}`);
  return data.data;
}

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

export async function fetchLogoTagsDto() {
  const { data } = await apiClient.get<ApiResponse<LogoTagDto[]>>("/api/logos/tags");
  if (!ok(data?.code)) throw new Error(data?.message || `API ${data?.code}`);
  return data.data;
}

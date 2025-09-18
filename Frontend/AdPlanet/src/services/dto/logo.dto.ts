import apiClient from "../../services/apiClient";
import type { ApiResponse } from "../../types/api";

/* ─────────────────────────────────────────────────────────────
   공통 유틸
───────────────────────────────────────────────────────────── */
const ok = (code?: string) => code === "S0000";

/** 절대 URL로 변환 (이미 절대면 그대로, 빈값이면 빈값, 상대면 baseURL 기준으로 절대) */
export const toAbsolute = (p: string) => {
  if (!p || /^https?:\/\//i.test(p)) return p;
  const base = (apiClient as any)?.defaults?.baseURL || "";
  return base ? new URL(p.startsWith("/") ? p : `/${p}`, base).toString() : p;
};

const splitToList = (s?: string): string[] =>
  (s ?? "")
    .split(/\r?\n|[;|]|,/) // 줄바꿈, 세미콜론, |, 쉼표 단위 분해
    .map(v => v.trim())
    .filter(Boolean);

const parseMinSize = (s?: string): { mm?: number; px?: number } => {
  if (!s) return {};
  const mm = s.match(/([\d.]+)\s*mm/i)?.[1];
  const px = s.match(/([\d.]+)\s*px/i)?.[1];
  return {
    mm: mm ? Number(mm) : undefined,
    px: px ? Number(px) : undefined,
  };
};

type ColorSpecDto = { color?: string; guide?: string; label: string };
const parseColorSpec = ({ color, guide, label }: ColorSpecDto) => {
  // color가 "Sky Blue #00AAFF" 혹은 "#00AAFF" 등일 수 있으니 둘 다 처리
  const hexMatch = color?.match(/#[0-9a-f]{6}/i)?.[0];
  const name =
    color && hexMatch ? color.replace(hexMatch, "").trim() || label : label;
  const hex = hexMatch ?? (color && /^#[0-9a-f]{6}$/i.test(color) ? color : undefined);
  return { name, hex, guide };
};

/* ─────────────────────────────────────────────────────────────
   DTO (서버 통신용 타입)
───────────────────────────────────────────────────────────── */
// 목록
export interface LogoListItemDto {
  logoId: number;
  name: string;
  slogan: string;
  imgUrl: string;
}

// 목록 조회 쿼리 (최신순, 오래된순, 태그ID)
export interface LogoListQueryDto {
  order?: "LATEST" | "OLDEST";
  tagId?: number;
}

// 상세
export interface LogoDetailDto {
  name: string;
  slogan: string;
  imgUrl: string;
  prompt?: string;
}

// 태그 목록
export interface LogoTagDto {
  tagId: number;
  tagName: string;
}

// CI 가이드라인 DTO
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

/* ─────────────────────────────────────────────────────────────
   Domain (UI/앱 내부에서 사용)
───────────────────────────────────────────────────────────── */
export interface LogoCard {
  id: number;
  name: string;
  slogan: string;
  imageUrl: string;
}

export interface LogoTag {
  id: number;
  name: string;
}

export interface CiGuideline {
  logoGuideLines?: string[];

  minSizeMm?: number;
  minSizePx?: number;
  marginRules?: string[];
  backgroundRules?: string[];
  prohibitionRules?: string[];

  palette: {
    primary?: { name: string; hex: string | undefined; guide?: string };
    secondary?: { name: string; hex: string | undefined; guide?: string };
    neutral?: { name: string; hex: string | undefined; guide?: string };
  };
}

export interface LogoDetail extends LogoCard {
  prompt?: string;
  tags?: LogoTag[];
  ci?: CiGuideline;
}

export type LogoListOrder = "LATEST" | "OLDEST";
export interface LogoListQuery {
  order?: LogoListOrder;
  tagId?: number;
}

/* ─────────────────────────────────────────────────────────────
   DTO -> Domain 매퍼
───────────────────────────────────────────────────────────── */
const mapLogoListItemDto = (dto: LogoListItemDto): LogoCard => ({
  id: dto.logoId,
  name: dto.name,
  slogan: dto.slogan,
  imageUrl: toAbsolute(dto.imgUrl),
});

const mapLogoDetailDto = (id: number, dto: LogoDetailDto): LogoDetail => ({
  id,
  name: dto.name,
  slogan: dto.slogan,
  imageUrl: toAbsolute(dto.imgUrl),
  prompt: dto.prompt,
});

const mapLogoTagDto = (dto: LogoTagDto): LogoTag => ({
  id: dto.tagId,
  name: dto.tagName,
});

const mapCiGuidelineDto = (dto?: CiGuidelineDto): CiGuideline | undefined => {
  if (!dto) return undefined;

  const { mm: minSizeMm, px: minSizePx } = parseMinSize(dto.minSize);

  const primary = parseColorSpec({
    color: dto.primaryColor,
    guide: dto.primaryGuide,
    label: "Primary",
  });
  const secondary = parseColorSpec({
    color: dto.secondaryColor,
    guide: dto.secondaryGuide,
    label: "Secondary",
  });
  const neutral = parseColorSpec({
    color: dto.neutralColor,
    guide: dto.neutralGuide,
    label: "Neutral",
  });

  const guidelines: string[] = [];
  if (dto.basicLogo) guidelines.push(dto.basicLogo);

  return {
    logoGuideLines: guidelines.length ? guidelines : undefined,
    minSizeMm,
    minSizePx,
    marginRules: splitToList(dto.marginRule),
    backgroundRules: splitToList(dto.backgroundRule),
    prohibitionRules: splitToList(dto.prohibitionRule),
    palette: {
      primary,
      secondary,
      neutral,
    },
  };
};

/* ─────────────────────────────────────────────────────────────
   API (DTO 레벨) 
───────────────────────────────────────────────────────────── */

export async function fetchLogoListDto(
  params: LogoListQueryDto
): Promise<ApiResponse<LogoListItemDto[]>> {
  const { data } = await apiClient.get<ApiResponse<LogoListItemDto[]>>("/api/logos", { params });
  return data; 
}

export async function fetchLogoDetailDto(
  logoId: number
): Promise<ApiResponse<LogoDetailDto>> {
  const { data } = await apiClient.get<ApiResponse<LogoDetailDto>>(`/api/logos/${logoId}`);
  return data; 
}

export async function fetchCiGuidelineDto(
  logoId: number
): Promise<ApiResponse<CiGuidelineDto>> {
  const { data } = await apiClient.get<ApiResponse<CiGuidelineDto>>(`/api/logos/${logoId}/ci-guideline`);
  return data; 
}

export async function createCiGuidelineDto(
  logoId: number
): Promise<ApiResponse<unknown>> {
  const { data } = await apiClient.post<ApiResponse<unknown>>(`/api/logos/${logoId}/ci-guideline`);
  return data; 
}

export async function fetchLogoTagsDto(): Promise<ApiResponse<LogoTagDto[]>> {
  const { data } = await apiClient.get<ApiResponse<LogoTagDto[]>>("/api/logos/tags");
  return data; 
}


/* ─────────────────────────────────────────────────────────────
   API (Domain 레벨) 
   - 반환 타입을 LogoCard/LogoDetail/LogoTag/CiGuideline로 매핑
───────────────────────────────────────────────────────────── */
export async function fetchLogoList(
  params: LogoListQuery = {}
): Promise<LogoCard[]> {
  const res = await fetchLogoListDto(params);
  if (!ok(res.code) || !Array.isArray(res.data)) throw new Error(res.message || `API ${res.code}`);
  return res.data.map(mapLogoListItemDto);
}

export async function fetchLogoDetail(logoId: number): Promise<LogoDetail> {
  const res = await fetchLogoDetailDto(logoId);
  if (!ok(res.code) || !res.data) throw new Error(res.message || `API ${res.code}`);
  return mapLogoDetailDto(logoId, res.data);
}

export async function fetchCiGuideline(
  logoId: number
): Promise<CiGuideline | undefined> {
  const res = await fetchCiGuidelineDto(logoId);
  if (!ok(res.code)) throw new Error(res.message || `API ${res.code}`);
  return mapCiGuidelineDto(res.data || {});
}

export async function fetchLogoTags(): Promise<LogoTag[]> {
  const res = await fetchLogoTagsDto();
  if (!ok(res.code) || !Array.isArray(res.data)) throw new Error(res.message || `API ${res.code}`);
  return res.data.map(mapLogoTagDto);
}

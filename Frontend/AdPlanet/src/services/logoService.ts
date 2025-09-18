// logoservice.ts
import {
  // Domain types
  type LogoCard,
  type LogoDetail,
  type CiGuideline,
  type LogoTag,
  type LogoListQuery,
  // DTO & 유틸
  fetchLogoListDto,
  fetchLogoDetailDto,
  fetchCiGuidelineDto,
  createCiGuidelineDto,
  fetchLogoTagsDto,
  type LogoListItemDto,
  type LogoListQueryDto,
  toAbsolute,
} from "./dto/logo.dto";

// API 성공 코드 헬퍼
const ok = (code?: string) => code === "S0000";

// 목록 매핑
const toLogoCard = (d: LogoListItemDto): LogoCard => ({
  id: d.logoId,
  name: d.name,
  slogan: d.slogan,
  imageUrl: toAbsolute(d.imgUrl),
});

export async function getLogoList(params: LogoListQuery): Promise<LogoCard[]> {
  console.debug("[logoService] getLogoList", params);
  const dtoParams: LogoListQueryDto = {
    order: params.order,
    tagId: params.tagId,
  };
  const res = await fetchLogoListDto(dtoParams); // ApiResponse<LogoListItemDto[]>
  if (!ok(res.code) || !Array.isArray(res.data)) {
    throw new Error(res.message || `API ${res.code}`);
  }
  console.debug("[logoService] dto items", res.data.length);
  return res.data.map(toLogoCard);
}

// 상세 매핑
export async function getLogoDetail(logoId: number): Promise<LogoDetail> {
  const res = await fetchLogoDetailDto(logoId); // ApiResponse<LogoDetailDto>
  if (!ok(res.code) || !res.data) throw new Error(res.message || `API ${res.code}`);
  const d = res.data;
  return {
    id: logoId,
    name: d.name,
    slogan: d.slogan,
    imageUrl: toAbsolute(d.imgUrl),
    prompt: d.prompt,
  };
}

// CI 가이드라인 매핑
const splitLines = (s?: string) =>
  s ? s.split(/\r?\n/).map(t => t.trim()).filter(Boolean) : [];

const pickNum = (s: string | undefined, re: RegExp) => {
  const m = s?.match(re);
  return m ? Number(m[1]) : undefined;
};

export async function getCiGuideline(logoId: number): Promise<CiGuideline> {
  const res = await fetchCiGuidelineDto(logoId); // ApiResponse<CiGuidelineDto>
  if (!ok(res.code)) throw new Error(res.message || `API ${res.code}`);
  const d = res.data || {};

  const minSizeMm = pickNum(d.minSize, /([\d.]+)\s*mm/i);
  const minSizePx = pickNum(d.minSize, /([\d.]+)\s*px/i);
  const toHex = (h?: string) => (h ? (h.startsWith("#") ? h : `#${h}`) : undefined);

  const mapped: CiGuideline = {
    logoGuideLines:   splitLines(d.basicLogo),
    marginRules:      splitLines(d.marginRule),
    backgroundRules:  splitLines(d.backgroundRule),
    prohibitionRules: splitLines(d.prohibitionRule),

    minSizeMm,
    minSizePx,

    palette: {
      primary:   d.primaryColor   ? { name: "Primary",   hex: toHex(d.primaryColor)!,   guide: d.primaryGuide }   : undefined,
      secondary: d.secondaryColor ? { name: "Secondary", hex: toHex(d.secondaryColor)!, guide: d.secondaryGuide } : undefined,
      neutral:   d.neutralColor   ? { name: "Neutral",   hex: toHex(d.neutralColor)!,   guide: d.neutralGuide }   : undefined,
    },
  };

  console.debug("[CI dto]", d);
  console.debug("[CI mapped]", mapped);
  return mapped;
}

// CI 가이드라인 생성
export async function createCiGuideline(logoId: number): Promise<void> {
  const res = await createCiGuidelineDto(logoId); // ApiResponse<unknown>
  if (!ok(res.code)) throw new Error(res.message || `API ${res.code}`);
}

// 태그 목록
export async function getAllLogoTags(): Promise<LogoTag[]> {
  const res = await fetchLogoTagsDto(); // ApiResponse<LogoTagDto[]>
  if (!ok(res.code) || !Array.isArray(res.data)) {
    throw new Error(res.message || `API ${res.code}`);
  }
  return res.data.map(t => ({ id: t.tagId, name: t.tagName }));
}


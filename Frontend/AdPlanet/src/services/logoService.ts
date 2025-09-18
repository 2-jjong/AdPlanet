import type { LogoCard, LogoDetail, CiGuideline, LogoTag, LogoListQuery } from "../types/logo";
import {
  fetchLogoListDto, fetchLogoDetailDto, fetchCiGuidelineDto, createCiGuidelineDto, fetchLogoTagsDto,
  type LogoListItemDto, toAbsolute,
} from "./dto/logo.dto";
import {  } from "./dto/logo.dto";


// 목록 매핑
const toLogoCard = (d: LogoListItemDto): LogoCard => ({
  id: d.logoId,
  name: d.name,
  slogan: d.slogan,
  imageUrl: toAbsolute(d.imgUrl),
});

export interface LogoListQueryDto {
  order?: "LATEST" | "OLDEST";
  tagId?: number;
}

export async function getLogoList(params: LogoListQuery): Promise<LogoCard[]> {
  console.debug("[logoService] getLogoList", params); // 서비스 진입
  const dtoParams: LogoListQueryDto = {
    order: params.order,
    tagId: params.tagId
};
  const list = await fetchLogoListDto(dtoParams);
  console.debug("[logoService] dto items", list.length); // DTO 결과
  return list.map(toLogoCard);
}

// 상세 매핑
export async function getLogoDetail(logoId: number): Promise<LogoDetail> {
  const d = await fetchLogoDetailDto(logoId);
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
  const d = await fetchCiGuidelineDto(logoId);

  const minSizeMm = pickNum(d.minSize, /(\d+)\s*mm/i);
  const minSizePx = pickNum(d.minSize, /(\d+)\s*px/i);
  const toHex = (h?: string) => (h ? (h.startsWith("#") ? h : `#${h}`) : undefined);

  const mapped: CiGuideline = {
    // 규정 문단들을 배열로 쪼개서 매핑
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

  // 디버깅용(원하면 잠깐 켜서 확인)
  console.debug("[CI dto]", d);
  console.debug("[CI mapped]", mapped);

  return mapped;
}

// CI 가이드라인 생성
export async function createCiGuideline(logoId: number): Promise<void> {
  await createCiGuidelineDto(logoId);
}


// 태그 목록
export async function getAllLogoTags(): Promise<LogoTag[]> {
  const list = await fetchLogoTagsDto();
  return list.map(t => ({ id: t.tagId, name: t.tagName }));
}

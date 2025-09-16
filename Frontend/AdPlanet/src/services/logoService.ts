import type { LogoCard, LogoDetail, CiGuideline, LogoTag, LogoListQuery } from "../types/logo";
import {
  fetchLogoListDto, fetchLogoDetailDto, fetchCiGuidelineDto, fetchLogoTagsDto,
  type LogoListItemDto, toAbsolute,
  type LogoListQueryDto,
} from "./dto/logo.dto";


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
  console.debug("[logoService] getLogoList", params); // ← 서비스 진입
  const dtoParams: LogoListQueryDto = {
    order: params.order,
    tagId: params.tagId
};
  const list = await fetchLogoListDto(dtoParams);
  console.debug("[logoService] dto items", list.length); // ← DTO 결과
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
export async function getCiGuideline(logoId: number): Promise<CiGuideline> {
  const d = await fetchCiGuidelineDto(logoId);
  // markdown bullet("- ")만 간단 파싱 → 라인 배열
  const lines =
    d.logoGuide
      ?.split("\n")
      .map((s) => s.trim())
      .filter((s) => s.startsWith("- "))
      .map((s) => s.replace(/^- /, ""));

  return {
    logoGuideLines: lines,
    palette: {
      primary:   d.primaryColor   ? { name: "Primary",   hex: d.primaryColor,   guide: d.primaryGuide }   : undefined,
      secondary: d.secondaryColor ? { name: "Secondary", hex: d.secondaryColor, guide: d.secondaryGuide } : undefined,
      neutral:   d.neutralColor   ? { name: "Neutral",   hex: d.neutralColor,   guide: d.neutralGuide }   : undefined,
    },
  };
}

// 태그 목록
export async function getAllLogoTags(): Promise<LogoTag[]> {
  const list = await fetchLogoTagsDto();
  return list.map(t => ({ id: t.tagId, name: t.tagName }));
}

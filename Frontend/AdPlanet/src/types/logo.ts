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
  logoGuideLines?: string[]; // markdown bullet를 라인 배열로 변환한 값
  palette: {
    primary?: { name: string; hex: string; guide?: string };
    secondary?: { name: string; hex: string; guide?: string };
    neutral?: { name: string; hex: string; guide?: string };
  };
}

export interface LogoDetail extends LogoCard {
  prompt?: string;
  tags?: LogoTag[];       // 필요 시 상세에서 사용
  ci?: CiGuideline;       // 필요 시 상세에서 사용
}

export type LogoListOrder = "LATEST" | "OLDEST";

export interface LogoListQuery {
  order?: LogoListOrder;
  tagId?: number;
}

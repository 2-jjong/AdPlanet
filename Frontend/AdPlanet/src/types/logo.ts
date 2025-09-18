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
    primary?: { name: string; hex: string; guide?: string };
    secondary?: { name: string; hex: string; guide?: string };
    neutral?: { name: string; hex: string; guide?: string };
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

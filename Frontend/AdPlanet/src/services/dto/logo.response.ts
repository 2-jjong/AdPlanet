// src/services/dto/logo.response.ts

// 목록 아이템
export interface LogoListItem {
  logoId: number;
  name: string;
  slogan: string;
  imgUrl: string;
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

export interface AssignedLogoTag {
  id: number;
  name: string;
}

// CI 가이드라인
export interface CiGuideline {
  id?: number;
  logoId?: number;
  basicLogo?: string;
  minSize?: string[];
  marginRule?: string;
  backgroundRule?: string;
  prohibitionRule?: string;
  primaryColor?: string;
  secondaryColor?: string;
  neutralColor?: string;
  primaryGuide?: {
    hex?: string;
    rgb?: string;     
    CMYK?: string;    
    mainUsage?: string;
  };
  secondaryGuide?: {
    hex?: string;
    rgb?: string;
    CMYK?: string;
    mainUsage?: string;
  };
  neutralGuide?: Array<{
    name?: string; 
    value?: string; 
  }>;
}

// 로고 생성 결과
export interface Logo {
  logoId: number;
  imgUrl: string;
}



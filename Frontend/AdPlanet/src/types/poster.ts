export type PosterResponse = {
  posterId: number;
  imgUrl: string;
  prompt: string;
};

export type PosterGroupResponse = {
  posterGroupId: number;
  imgUrl: string;       // 대표 이미지
  prompt: string;       // 대표 프롬프트
  createdAt: string;    // 생성일
  history: PosterResponse[];
};

export type ApiResponse<T> = {
  code: string;
  data: T;
  message: string;
};

// 포스터 상세
export type PosterHistory = {
  posterId: number;
  imgUrl: string;
  prompt: string;
};

export type PosterGroupDetail = {
  posterGroupId: number;
  imgUrl: string;     
  prompt: string;     
  title: string;      
  content: string;    
  createdAt: string;
  history: PosterHistory[];
};

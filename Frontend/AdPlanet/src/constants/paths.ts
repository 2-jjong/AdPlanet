// 라우트 경로 상수 정의
export const PATHS = {
  HOME: '/',
  LOGO: '/logo',
  POSTER: '/poster',
  WATERMARK_DETECTION: '/watermark-detection',
  ARCHIVE: '/archive',
  AUTH_CALLBACK: '/auth/callback',
} as const;

// 경로 타입 정의
export type PathType = typeof PATHS[keyof typeof PATHS];

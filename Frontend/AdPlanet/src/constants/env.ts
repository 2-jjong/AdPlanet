// 환경변수 타입 정의
export interface EnvConfig {
  VITE_SSAFY_CLIENT_ID: string;
  VITE_SSAFY_REDIRECT_URI: string;
  VITE_SSAFY_OAUTH_URL: string;
}

// 환경변수 가져오기 함수
export const getEnvConfig = (): EnvConfig => {
  return {
    VITE_SSAFY_CLIENT_ID: import.meta.env.VITE_SSAFY_CLIENT_ID || '',
    VITE_SSAFY_REDIRECT_URI: import.meta.env.VITE_SSAFY_REDIRECT_URI || 'http://localhost:5173/auth/callback',
    VITE_SSAFY_OAUTH_URL: import.meta.env.VITE_SSAFY_OAUTH_URL || 'https://project.ssafy.com/oauth/sso-check',
  };
};
  
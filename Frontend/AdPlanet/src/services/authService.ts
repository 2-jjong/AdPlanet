import apiClient from './apiClient';
import type { ApiResponse } from '../types/api';
import { getEnvConfig } from '../constants/env';

/**
 * SSAFY OAuth SSO 로그인 URL 생성
 */
export const generateSSAFYLoginUrl = (): string => {
  const config = getEnvConfig();

  const params = new URLSearchParams({
    client_id: config.VITE_SSAFY_CLIENT_ID,
    redirect_uri: config.VITE_SSAFY_REDIRECT_URI,
    response_type: 'code',
  });

  return `${config.VITE_SSAFY_OAUTH_URL}/sso-check?${params.toString()}`;
};

/**
 * SSAFY OAuth 로그인 실행
 */
export const loginWithSSAFY = (): void => {
  window.location.href = generateSSAFYLoginUrl();
};

/**
 * OAuth 콜백에서 인증 코드 추출
 */
export const extractAuthCode = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('code');
};

/**
 * OAuth 인가 코드를 사용하여 로그인
 * @param authCode OAuth 인가 코드
 * @returns 로그인 성공 여부
 */
export const loginWithAuthCode = async (authCode: string): Promise<ApiResponse<null>> => {
  const { data } = await apiClient.post<ApiResponse<null>>('/api/auth/login', {
    code: authCode
  });
  return data;
};

/**
 * 토큰 재발급
 * @returns 재발급 성공 여부
 */
export const reissueToken = async (): Promise<ApiResponse<null>> => {
  const { data } = await apiClient.post<ApiResponse<null>>('/api/auth/reissue');
  return data;
};

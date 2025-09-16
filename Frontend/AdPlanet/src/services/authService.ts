import {getEnvConfig} from '../constants/env';
import apiClient from './apiClient';
import type { ApiResponse } from '../types/api';

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
  // 새 창에서 OAuth 인증 페이지 열기
  window.location.href = generateSSAFYLoginUrl();
};

/**
 * OAuth 콜백에서 인증 코드 추출
 */
export const extractAuthCode = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  console.log(urlParams.get('code'));
  return urlParams.get('code');
};

/**
 * OAuth 인가 코드를 사용하여 로그인
 * @param authCode OAuth 인가 코드
 * @returns 로그인 성공 여부
 */
export const loginWithAuthCode = async (authCode: string): Promise<boolean> => {
  try {
    const response = await apiClient.post<ApiResponse<null>>('/api/auth/login', {
      code: authCode
    });

    console.log('로그인 응답:', response.data);
    console.log('로그인 응답 상태:', response.status);
    return response.status === 200;
  } catch (error) {
    console.error('로그인 실패:', error);
    return false;
  }
};

/**
 * 토큰 재발급
 * @returns 재발급 성공 여부
 */
export const reissueToken = async (): Promise<boolean> => {
  try {
    const response = await apiClient.post<ApiResponse<null>>('/api/auth/reissue');
    
    console.log('토큰 재발급 응답:', response.data);
    
    // 성공 시 200 HTTP 응답 코드와 성공 비즈니스 코드 확인
    // apiClient의 응답 인터셉터가 자동으로 새 토큰을 AuthContext에 저장함
    console.log('토큰 재발급 응답 상태:', response.status);
    console.log('토큰 재발급 응답 코드:', response.data);
    return response.status === 200 ;
    } catch (error) {
    console.error('토큰 재발급 실패:', error);
    return false;
  }
};

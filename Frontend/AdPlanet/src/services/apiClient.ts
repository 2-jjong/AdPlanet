// src/services/apiClient.ts
import axios from 'axios';
import { API_BASE_URL } from '../constants/baseUrl'; // 상수 파일에서 URL 가져오기
import { authSelectors, authActions } from '../contexts/authActions';
import { reissueToken } from './authService';
import type { ApiResponse } from '../types/api';

// API 클라이언트 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL, 
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 쿠키를 자동으로 포함
});

// 요청 인터셉터: 모든 요청에 토큰 자동 추가 (reissue 경로는 제외)
apiClient.interceptors.request.use(
  (config) => {
    const isReissue = typeof config.url === 'string' && config.url.includes('/api/auth/reissue');
    if (!isReissue) {
      const token = authSelectors.getToken();
      if (token) {
        (config.headers as any).Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 응답에서 토큰 자동 저장 및 재발급 처리
apiClient.interceptors.response.use(
  (response) => {
    // blob(이미지 등) 응답은 표준화하지 않고 원본 데이터 반환
    const wantsBlob = (response?.config as any)?.responseType === 'blob';
    const isImage = typeof response?.headers?.['content-type'] === 'string' && response.headers['content-type'].startsWith('image/');
    if (wantsBlob || isImage) {
      return response.data as any;
    }
    // Authorization 헤더에서 토큰 추출하여 AuthContext에 저장
    const authHeader = response.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', ''); // 'Bearer ' 정확히 제거
      authActions.login(token); // 토큰 설정과 함께 로그인 상태도 설정
    } else {
      // 바디에 accessToken이 담겨오는 경우 대비 (서버 구현 차이 대응)
      try {
        const maybeToken = (response.data?.data?.accessToken) || (response.data?.accessToken);
        if (typeof maybeToken === 'string' && maybeToken.length > 0) {
          authActions.login(maybeToken);
        }
      } catch (_) {}
    }

    // 응답을 ApiResponse 형식으로 변환
    // 서버가 이미 ApiResponse<T> 형태를 준다고 가정하되, 방어적으로 표준화
    const standardized: typeof response = {
      ...response,
      data: {
        code: response.data?.code,
        data: response.data?.data ?? null,
        message: response.data?.message ?? null,
      } as ApiResponse<unknown>,
    } as any;

    return standardized;
  },
  async (error) => {
    const originalRequest = error.config || {};
    const url: string = typeof originalRequest.url === 'string' ? originalRequest.url : '';
    const isReissue = url.includes('/api/auth/reissue');

    // reissue 요청 자체가 401이면 재귀 재시도 방지
    if (isReissue) {
      return Promise.reject(error);
    }

    // 401 에러이고 재시도하지 않은 요청인 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // 토큰 재발급 시도
        const reissue = await reissueToken();
        if (reissue?.code === 'S0000') {
          // 재발급 성공 시 원래 요청 재시도
          return apiClient(originalRequest);
        } else {
          authActions.logout();
        }
      } catch (reissueError) {
        console.error('토큰 재발급 중 에러:', reissueError);
        authActions.logout();
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
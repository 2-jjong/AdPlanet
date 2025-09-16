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

// 요청 인터셉터: 모든 요청에 토큰 자동 추가
apiClient.interceptors.request.use(
   (config) => {
    const token = authSelectors.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
    // Authorization 헤더에서 토큰 추출하여 AuthContext에 저장
    const authHeader = response.headers.authorization;
    console.log('응답 헤더:', response.headers);
    console.log('Authorization 헤더:', authHeader);
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', ''); // 'Bearer ' 정확히 제거
      console.log('토큰 추출:', token);
      console.log('authActions.login 호출 전');
      authActions.login(token); // 토큰 설정과 함께 로그인 상태도 설정
      console.log('authActions.login 호출 후');
    }

    // 응답을 ApiResponse 형식으로 변환
    const standardizedResponse = {
      ...response,
      data: {
        code: response.data?.code,
        data: response.data?.data || null, // 실제 데이터 (없으면 null)
        message: response.data?.message || null // 메시지 (없으면 null)
      } as ApiResponse<never>
    };

    return standardizedResponse;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // 401 에러이고 재시도하지 않은 요청인 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // 토큰 재발급 시도
        const reissueSuccess = await reissueToken();
        
        if (reissueSuccess) {
          // 재발급 성공 시 원래 요청 재시도
          return apiClient(originalRequest);
        } else {
          // 재발급 실패 시 로그아웃
          authActions.logout();
        }
      } catch (reissueError) {
        // 재발급 중 에러 발생 시 로그아웃
        console.error('토큰 재발급 중 에러:', reissueError);
        authActions.logout();
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
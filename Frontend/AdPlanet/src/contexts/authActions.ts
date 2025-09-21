import type { AuthContextType } from '../types/auth';
import { ACCESS_TOKEN_KEY } from '../constants/auth';

// 전역 Auth 인스턴스 (Context 외부에서 사용)
let globalAuthInstance: AuthContextType | null = null;

// 전역 인스턴스 설정 함수
export const setGlobalAuthInstance = (authInstance: AuthContextType) => {
  globalAuthInstance = authInstance;
};

// 전역 인스턴스 가져오기 함수
export const getGlobalAuthInstance = (): AuthContextType | null => {
  return globalAuthInstance;
};

// 편의 함수들 (Context 외부에서 사용)
export const authActions = {
  login: (token: string) => {
    console.log('authActions.login 호출됨, 토큰:', token);
    console.log('globalAuthInstance:', globalAuthInstance);
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
      }
    } catch (_) {}
    if (globalAuthInstance) {
      console.log('globalAuthInstance.login 호출');
      globalAuthInstance.login(token);
    } else {
      console.warn('AuthProvider가 초기화되지 않았습니다.');
    }
  },
  
  logout: () => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(ACCESS_TOKEN_KEY);
      }
    } catch (_) {}
    if (globalAuthInstance) {
      globalAuthInstance.logout();
    } else {
      console.warn('AuthProvider가 초기화되지 않았습니다.');
    }
  },

  setToken: (token: string | null) => {
    try {
      if (typeof window !== 'undefined') {
        if (token) {
          window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
        } else {
          window.localStorage.removeItem(ACCESS_TOKEN_KEY);
        }
      }
    } catch (_) {}
    if (globalAuthInstance) {
      globalAuthInstance.setToken(token);
    } else {
      console.warn('AuthProvider가 초기화되지 않았습니다.');
    }
  },
};

// 상태 선택자들
export const authSelectors = {
  isLoggedIn: () => {
    if (globalAuthInstance) return globalAuthInstance.isLoggedIn;
    try {
      if (typeof window !== 'undefined') {
        const storedToken = window.localStorage.getItem(ACCESS_TOKEN_KEY);
        return !!storedToken;
      }
    } catch (_) {}
    return false;
  },
  getToken: () => {
    if (globalAuthInstance?.token) return globalAuthInstance.token;
    try {
      if (typeof window !== 'undefined') {
        return window.localStorage.getItem(ACCESS_TOKEN_KEY);
      }
    } catch (_) {}
    return null;
  },
};

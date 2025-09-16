import type { AuthContextType } from '../types/auth';

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
    if (globalAuthInstance) {
      console.log('globalAuthInstance.login 호출');
      globalAuthInstance.login(token);
    } else {
      console.warn('AuthProvider가 초기화되지 않았습니다.');
    }
  },
  
  logout: () => {
    if (globalAuthInstance) {
      globalAuthInstance.logout();
    } else {
      console.warn('AuthProvider가 초기화되지 않았습니다.');
    }
  },

  setToken: (token: string | null) => {
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
    return globalAuthInstance?.isLoggedIn ?? false;
  },
  getToken: () => {
    return globalAuthInstance?.token ?? null;
  },
};

import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

// 인증 상태 타입 정의
interface AuthState {
  isLoggedIn: boolean;
  token: string | null;
}

// 인증 액션 타입 정의
interface AuthActions {
  login: (token: string) => void;
  logout: () => void;
  setToken: (token: string | null) => void;
}

// 전체 Context 타입
type AuthContextType = AuthState & AuthActions;

// Context 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider Props 타입
interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider 컴포넌트
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);

  // 로그인 액션
  const login = (authToken: string) => {
    setIsLoggedIn(true);
    setToken(authToken);
  };

  // 로그아웃 액션
  const logout = () => {
    setIsLoggedIn(false);
    setToken(null);
  };

  // 토큰 설정
  const setAuthToken = (authToken: string | null) => {
    setToken(authToken);
  };

  const value: AuthContextType = {
    // 상태
    isLoggedIn,
    token,
    
    // 액션
    login,
    logout,
    setToken: setAuthToken,
  };

  // 전역 인스턴스 설정
  React.useEffect(() => {
    setGlobalAuthInstance(value);
  }, [value]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook: useAuth
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

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
    if (globalAuthInstance) {
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

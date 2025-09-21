import React, { createContext, useState } from 'react';
import type { AuthContextType, AuthProviderProps } from '../types/auth';
import { setGlobalAuthInstance } from './authActions';
import { ACCESS_TOKEN_KEY } from '../constants/auth';

// Context 생성
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider 컴포넌트
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);

  // 초기 마운트 시 localStorage에서 토큰 복원
  React.useEffect(() => {
    try {
      const storedToken = typeof window !== 'undefined' ? window.localStorage.getItem(ACCESS_TOKEN_KEY) : null;
      if (storedToken) {
        setToken(storedToken);
        setIsLoggedIn(true);
      }
    } catch (_) {
      // storage 접근 불가 시 무시
    }
  }, []);

  // 로그인 액션
  const login = (authToken: string) => {
    setIsLoggedIn(true);
    setToken(authToken);
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(ACCESS_TOKEN_KEY, authToken);
      }
    } catch (_) {
      // storage 접근 불가 시 무시
    }
  };

  // 로그아웃 액션
  const logout = () => {
    setIsLoggedIn(false);
    setToken(null);
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(ACCESS_TOKEN_KEY);
      }
    } catch (_) {
      // storage 접근 불가 시 무시
    }
  };

  // 토큰 설정
  const setAuthToken = (authToken: string | null) => {
    setToken(authToken);
    setIsLoggedIn(!!authToken);
    try {
      if (typeof window !== 'undefined') {
        if (authToken) {
          window.localStorage.setItem(ACCESS_TOKEN_KEY, authToken);
        } else {
          window.localStorage.removeItem(ACCESS_TOKEN_KEY);
        }
      }
    } catch (_) {
      // storage 접근 불가 시 무시
    }
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


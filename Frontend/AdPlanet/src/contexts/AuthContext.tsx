import React, { createContext, useState } from 'react';
import type { AuthContextType, AuthProviderProps } from '../types/auth';
import { setGlobalAuthInstance } from './authActions';

// Context 생성
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

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


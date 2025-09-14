import React, { createContext, useContext, useState, ReactNode } from 'react';

// 인증 상태 타입 정의
interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
}

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  token: string | null;
}

// 인증 액션 타입 정의
interface AuthActions {
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
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
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // 로그인 액션
  const login = (userData: User, authToken: string) => {
    setIsLoggedIn(true);
    setUser(userData);
    setToken(authToken);
  };

  // 로그아웃 액션
  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setToken(null);
  };

  // 사용자 정보 설정
  const setUserInfo = (userData: User | null) => {
    setUser(userData);
  };

  // 토큰 설정
  const setAuthToken = (authToken: string | null) => {
    setToken(authToken);
  };

  const value: AuthContextType = {
    // 상태
    isLoggedIn,
    user,
    token,
    
    // 액션
    login,
    logout,
    setUser: setUserInfo,
    setToken: setAuthToken,
  };

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

// 편의 함수들 (Context 외부에서 사용)
export const authActions = {
  login: (user: User, token: string) => {
    // 이 함수들은 Context 내부에서만 사용 가능
    console.warn('authActions.login should be used within AuthProvider');
  },
  
  logout: () => {
    console.warn('authActions.logout should be used within AuthProvider');
  },
};

// 상태 선택자들
export const authSelectors = {
  isLoggedIn: () => {
    console.warn('authSelectors.isLoggedIn should be used within AuthProvider');
    return false;
  },
  getUser: () => {
    console.warn('authSelectors.getUser should be used within AuthProvider');
    return null;
  },
  getToken: () => {
    console.warn('authSelectors.getToken should be used within AuthProvider');
    return null;
  },
};

import type { ReactNode } from 'react';

// 인증 상태 타입 정의
export interface AuthState {
  isLoggedIn: boolean;
  token: string | null;
}

// 인증 액션 타입 정의
export interface AuthActions {
  login: (token: string) => void;
  logout: () => void;
  setToken: (token: string | null) => void;
}

// 전체 Context 타입
export type AuthContextType = AuthState & AuthActions;

// Provider Props 타입
export interface AuthProviderProps {
  children: ReactNode;
}

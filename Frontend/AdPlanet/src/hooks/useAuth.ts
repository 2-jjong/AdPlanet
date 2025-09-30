import { useContext } from 'react';
import type { AuthContextType } from '../types/auth';
import { AuthContext } from '../contexts/AuthContext';


/**
 * 인증 관련 상태와 액션을 사용하는 커스텀 훅
 * @returns AuthContextType - 인증 상태와 액션들
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

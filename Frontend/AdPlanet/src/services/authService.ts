import {getEnvConfig} from '../constants/env';

/**
 * SSAFY OAuth SSO 로그인 URL 생성
 */
export const generateSSAFYLoginUrl = (): string => {
  const config = getEnvConfig();
  
  const params = new URLSearchParams({
    client_id: config.VITE_SSAFY_CLIENT_ID,
    redirect_uri: config.VITE_SSAFY_REDIRECT_URI,
    response_type: 'code',
  });

  return `${config.VITE_SSAFY_OAUTH_URL}/sso-check?${params.toString()}`;
};

/**
 * SSAFY OAuth 로그인 실행
 */
export const loginWithSSAFY = (): void => {
  // 새 창에서 OAuth 인증 페이지 열기
  window.location.href = generateSSAFYLoginUrl();
};

/**
 * OAuth 콜백에서 인증 코드 추출
 */
export const extractAuthCode = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('code');
};

/**
 * 인증 코드로 사용자 정보 가져오기 (실제 서버 API 호출)
 */
export const fetchUserInfo = async (authCode: string): Promise<unknown> => {
  try {
    const response = await fetch('http://j13d201.p.ssafy.io/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: authCode,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('사용자 정보 가져오기 실패:', error);
    throw error;
  }
};

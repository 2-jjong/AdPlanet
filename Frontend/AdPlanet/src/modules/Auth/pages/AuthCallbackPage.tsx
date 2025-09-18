import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { extractAuthCode, loginWithAuthCode } from "../../../services/authService";
import { PATHS } from "../../../constants/paths";

const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // URL에서 인증 코드 추출
        const authCode = extractAuthCode();

        if (authCode) {
          // 인증 코드로 로그인 처리
          const loginSuccess = await loginWithAuthCode(authCode);

          if (loginSuccess) {
            setStatus("success");
            setMessage("로그인에 성공했습니다!");

            // 2초 후 홈페이지로 리다이렉트
            setTimeout(() => {
              navigate(PATHS.HOME);
            }, 2000);
          } else {
            setStatus("error");
            setMessage("로그인에 실패했습니다.");

            // 3초 후 홈페이지로 리다이렉트
            setTimeout(() => {
              navigate(PATHS.HOME);
            }, 3000);
          }
        } else {
          // 인증 코드가 없으면 에러
          setStatus("error");
          setMessage("인증 코드를 찾을 수 없습니다.");

          // 3초 후 홈페이지로 리다이렉트
          setTimeout(() => {
            navigate(PATHS.HOME);
          }, 3000);
        }
      } catch (error) {
        setStatus("error");
        setMessage("로그인 처리 중 오류가 발생했습니다.");
        console.error("Auth callback error:", error);

        // 에러 시에도 홈페이지로 리다이렉트
        setTimeout(() => {
          navigate(PATHS.HOME);
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center'>
      <div className='text-center'>
        {status === "loading" && (
          <>
            <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mx-auto mb-4'></div>
            <p className='text-white text-lg'>로그인 처리 중...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className='text-6xl mb-4'>✅</div>
            <p className='text-green-400 text-lg font-semibold'>{message}</p>
            <p className='text-gray-300 text-sm mt-2'>잠시 후 홈페이지로 이동합니다...</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className='text-6xl mb-4'>❌</div>
            <p className='text-red-400 text-lg font-semibold'>{message}</p>
            <p className='text-gray-300 text-sm mt-2'>잠시 후 홈페이지로 이동합니다...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallbackPage;

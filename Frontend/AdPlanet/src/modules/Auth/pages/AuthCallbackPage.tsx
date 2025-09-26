import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginWithAuthCode, extractAuthCode } from "../../../services/authService";
import type { ApiResponse } from "../../../types/api";
import { PATHS } from "../../../constants/paths";
import SuccessMsg from "../components/SuccessMsg";
import FailMsg from "../components/FailMsg";

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
          const res: ApiResponse<null> = await loginWithAuthCode(authCode);
          if (res.code === 'S0000') {
            setStatus("success");
            setMessage("로그인에 성공했습니다!");

            // 2초 후 홈페이지로 리다이렉트
            setTimeout(() => {
              // navigate(PATHS.HOME);
              navigate(PATHS.HOME, { state: { from: PATHS.AUTH_CALLBACK } });   // 화면전환 위해 상태 저장

            // }, 2000);
            }, 3000);
          } else {
            setStatus("error");
            setMessage(res.message || "로그인에 실패했습니다.");

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
    <div
      className='min-h-screen bg-background from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center'
    >
      <div className='text-center'>
        {status === "loading" && (
          <>
            <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mx-auto mb-4'></div>
            <p className='text-white text-lg'>로그인 처리 중...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div>
              <SuccessMsg />
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div>
              <FailMsg /> 
            </div>
          </>
        )}
      </div>
    </div>
  );
};


export default AuthCallbackPage;

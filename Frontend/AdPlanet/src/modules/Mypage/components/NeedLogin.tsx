// src/modules/Mypage/components/NeedLogin.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import loginFailImage from "../../../assets/images/login_fail.png";

interface NeedLoginProps {
  message?: string;
}

export default function NeedLogin({ message = "로그인이 필요한 서비스입니다." }: NeedLoginProps) {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex flex-col items-center space-y-6 max-w-md">
        {/* 로그인 실패 이미지 */}
        <div className="flex items-center justify-center">
          <img
            src={loginFailImage}
            alt="로그인 필요"
            className="w-185 h-185 object-contain"
          />
        </div>

        {/* 메시지 */}
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-white">
            {message}
          </h3>
        </div>
      </div>
    </div>
  );
}
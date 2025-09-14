import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { PATHS } from '../constants/paths';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* 배경 별들 */}
      <div className="absolute inset-0">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* 헤더 */}
      <Navigation />

      {/* 메인 컨텐츠 */}
      <main className="relative z-10 flex flex-col lg:flex-row items-center justify-between min-h-[calc(100vh-80px)] px-4 lg:px-12">
        {/* 왼쪽 텍스트 영역 */}
        <div className="flex-1 max-w-2xl mb-8 lg:mb-0 text-center lg:text-left">
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white mb-4 lg:mb-6 leading-tight">
            AI로 만드는<br />
            완벽한 디자인
          </h1>
          <p className="text-lg lg:text-xl text-gray-300 mb-6 lg:mb-8 leading-relaxed">
            브랜드의 탄생부터 마케팅까지 책임지는<br />
            AdPlanet의 기술을 경험해보세요
          </p>
        </div>

        {/* 오른쪽 우주 영역 */}
        <div className="flex-1 relative w-full h-80 sm:h-96 lg:h-[600px]">
          {/* 큰 파란 행성 */}
          <div className="absolute bottom-0 right-0 w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 opacity-80 animate-float"></div>

          {/* 갈색 행성 (포스터 생성) */}
          <div
            className="absolute top-16 sm:top-20 left-4 sm:left-8 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 opacity-90 animate-float cursor-pointer hover:opacity-100 transition-opacity duration-300"
            style={{animationDuration: '3s'}}
            onClick={() => navigate(PATHS.POSTER)}
          >
            <div className="absolute -bottom-6 sm:-bottom-8 left-1/2 transform -translate-x-1/2 text-white text-xs whitespace-nowrap font-medium">
              포스터 생성
            </div>
          </div>

          {/* 빨간 행성 (로고 생성) */}
          <div
            className="absolute top-24 sm:top-32 right-12 sm:right-20 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-red-500 to-pink-600 opacity-90 animate-float cursor-pointer hover:opacity-100 transition-opacity duration-300"
            style={{animationDuration: '4s'}}
            onClick={() => navigate(PATHS.LOGO)}
          >
            <div className="absolute -bottom-6 sm:-bottom-8 left-1/2 transform -translate-x-1/2 text-white text-xs whitespace-nowrap font-medium">
              로고 생성
            </div>
          </div>

          {/* 우주비행사 로켓 */}
          <div className="absolute top-1/2 right-1/4 animate-float" style={{animationDuration: '2s'}}>
            <div className="relative">
              {/* 로켓 */}
              <div className="w-6 h-12 sm:w-8 sm:h-16 bg-gradient-to-b from-red-500 to-red-600 rounded-t-lg relative shadow-lg">
                <div className="absolute -bottom-1 sm:-bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-3 sm:w-6 sm:h-4 bg-orange-500 rounded-b-lg"></div>
                {/* 불꽃 */}
                <div className="absolute -bottom-3 sm:-bottom-4 left-1/2 transform -translate-x-1/2 w-1.5 h-2 sm:w-2 sm:h-3 bg-orange-400 rounded-b-full animate-pulse"></div>
                <div className="absolute -bottom-4 sm:-bottom-5 left-1/2 transform -translate-x-1/2 w-0.5 h-1 sm:w-1 sm:h-2 bg-red-400 rounded-b-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                <div className="absolute -bottom-5 sm:-bottom-6 left-1/2 transform -translate-x-1/2 w-0.5 h-0.5 sm:w-0.5 sm:h-1 bg-yellow-400 rounded-b-full animate-pulse" style={{animationDelay: '1s'}}></div>
              </div>
              {/* 우주비행사 */}
              <div className="absolute -top-1 sm:-top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 sm:w-6 sm:h-6 bg-white rounded-full shadow-md">
                <div className="absolute top-0.5 sm:top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-purple-400 rounded-full opacity-80"></div>
                <div className="absolute -top-0.5 sm:-top-1 left-1/2 transform -translate-x-1/2 w-0.5 h-0.5 sm:w-1 sm:h-1 bg-white rounded-full"></div>
              </div>
              {/* 팔 */}
              <div className="absolute top-1 sm:top-2 -right-0.5 sm:-right-1 w-1.5 h-3 sm:w-2 sm:h-4 bg-white rounded-full transform rotate-12 shadow-sm"></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;

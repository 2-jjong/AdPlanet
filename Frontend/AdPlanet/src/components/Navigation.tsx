import React, { useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation: React.FC = () => {
  const location = useLocation();
  const [isGeneratorHovered, setIsGeneratorHovered] = useState(false);
  // setTimeout의 타이머 ID를 저장하기 위한 useRef
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const isGeneratorActive = () => {
    return location.pathname === '/logo' || location.pathname === '/poster';
  };

  // 마우스가 들어왔을 때 실행할 함수
  const handleMouseEnter = () => {
    // 혹시라도 '닫기' 타이머가 작동 중이면 취소
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsGeneratorHovered(true);
  };

  // 마우스가 나갔을 때 실행할 함수
  const handleMouseLeave = () => {
    // 150ms 후에 메뉴를 닫도록 타이머 설정
    timeoutRef.current = setTimeout(() => {
      setIsGeneratorHovered(false);
    }, 150);
  };

  return (
    <header className="relative z-50 flex justify-between items-center p-4 lg:px-12">
      <Link 
        to="/"
        className="text-xl lg:text-2xl font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
      >
        AdPlanet
      </Link>
      
      <nav className="hidden md:flex space-x-6 lg:space-x-8 text-white">
        {/* Generator 드롭다운: 새로운 마우스 핸들러 적용 */}
        <div 
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div 
            className={`transition-colors text-sm lg:text-base cursor-pointer ${
              isGeneratorActive() 
                ? 'text-cyan-400 font-semibold' 
                : 'hover:text-cyan-400'
            }`}
          >
            Generator
            <span className="ml-1">▼</span>
          </div>
          
          <div 
            className={`absolute top-full left-0 mt-1 w-40 bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden transition-all duration-300 ${
              isGeneratorHovered 
                ? 'opacity-100 transform translate-y-0 pointer-events-auto' 
                : 'opacity-0 transform -translate-y-2 pointer-events-none'
            }`}
          >
            <Link 
              to="/logo" 
              className={`block px-4 py-3 text-sm transition-colors ${
                isActive('/logo') 
                  ? 'text-cyan-400 bg-slate-700/50' 
                  : 'text-white hover:text-cyan-400 hover:bg-slate-700/30'
              }`}
            >
              로고 생성
            </Link>
            <Link 
              to="/poster" 
              className={`block px-4 py-3 text-sm transition-colors ${
                isActive('/poster') 
                  ? 'text-cyan-400 bg-slate-700/50' 
                  : 'text-white hover:text-cyan-400 hover:bg-slate-700/30'
              }`}
            >
              포스터 생성
            </Link>
          </div>
        </div>

        <Link 
          to="/watermark-detection" 
          className={`transition-colors text-sm lg:text-base ${
            isActive('/watermark-detection') 
              ? 'text-cyan-400 font-semibold' 
              : 'hover:text-cyan-400'
          }`}
        >
          Watermark Detection
        </Link>
        <Link 
          to="/archive" 
          className={`transition-colors text-sm lg:text-base ${
            isActive('/archive') 
              ? 'text-cyan-400 font-semibold' 
              : 'hover:text-cyan-400'
          }`}
        >
          Archive
        </Link>
      </nav>
      
      <button className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 lg:px-6 rounded-lg transition-colors text-sm lg:text-base">
        Sign in
      </button>
    </header>
  );
};

export default Navigation;
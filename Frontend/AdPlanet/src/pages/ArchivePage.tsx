import React from 'react';
import Navigation from '../components/Navigation';

const ArchivePage: React.FC = () => {
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
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 lg:px-12">
        <div className="text-center max-w-4xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            아카이브
          </h1>
          <p className="text-lg lg:text-xl text-gray-300 mb-8 leading-relaxed">
            이전에 생성한 디자인들을 관리하고 다시 사용해보세요
          </p>
          
          {/* 아카이브 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div key={item} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-colors cursor-pointer">
                <div className="w-full h-32 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg mb-3 flex items-center justify-center">
                  <span className="text-white text-lg">작품 {item}</span>
                </div>
                <h4 className="text-white font-medium text-sm mb-1">작품 제목 {item}</h4>
                <p className="text-gray-400 text-xs">2024.01.{item.toString().padStart(2, '0')}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ArchivePage;

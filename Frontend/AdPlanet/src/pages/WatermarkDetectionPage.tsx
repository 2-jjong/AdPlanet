import React from 'react';
import Navigation from '../components/Navigation';

const WatermarkDetectionPage: React.FC = () => {
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
            워터마크 검출
          </h1>
          <p className="text-lg lg:text-xl text-gray-300 mb-8 leading-relaxed">
            AI가 이미지에서 워터마크를 자동으로 검출하고 제거합니다
          </p>
          
          {/* 워터마크 검출 영역 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* 입력 영역 */}
              <div className="space-y-6">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    이미지 업로드
                  </label>
                  <div className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center hover:border-cyan-400 transition-colors cursor-pointer">
                    <div className="text-4xl mb-4">📁</div>
                    <p className="text-white mb-2">이미지를 드래그하거나 클릭하여 업로드</p>
                    <p className="text-gray-400 text-sm">JPG, PNG, GIF 파일 지원</p>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="inline-block mt-4 bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-lg transition-colors cursor-pointer"
                    >
                      파일 선택
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    검출 옵션
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center text-white">
                      <input type="checkbox" className="mr-3 rounded" defaultChecked />
                      자동 워터마크 검출
                    </label>
                    <label className="flex items-center text-white">
                      <input type="checkbox" className="mr-3 rounded" />
                      워터마크 제거
                    </label>
                    <label className="flex items-center text-white">
                      <input type="checkbox" className="mr-3 rounded" />
                      고품질 복원
                    </label>
                  </div>
                </div>
                
                <button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105">
                  워터마크 검출 시작
                </button>
              </div>
              
              {/* 결과 영역 */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-white font-semibold mb-3">원본 이미지</h3>
                  <div className="w-full h-48 bg-white/10 border-2 border-dashed border-white/30 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <div className="text-3xl mb-2">🖼️</div>
                      <p className="text-sm">업로드된 이미지가 여기에 표시됩니다</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-white font-semibold mb-3">검출 결과</h3>
                  <div className="w-full h-48 bg-white/10 border-2 border-dashed border-white/30 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <div className="text-3xl mb-2">🔍</div>
                      <p className="text-sm">검출된 워터마크가 여기에 표시됩니다</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 기능 설명 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-white font-semibold mb-2">정확한 검출</h3>
              <p className="text-gray-300 text-sm">AI가 다양한 워터마크를 정확하게 검출합니다</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="text-white font-semibold mb-2">빠른 처리</h3>
              <p className="text-gray-300 text-sm">고속 알고리즘으로 빠르게 처리합니다</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="text-3xl mb-3">🛡️</div>
              <h3 className="text-white font-semibold mb-2">안전한 처리</h3>
              <p className="text-gray-300 text-sm">업로드된 이미지는 안전하게 처리됩니다</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WatermarkDetectionPage;

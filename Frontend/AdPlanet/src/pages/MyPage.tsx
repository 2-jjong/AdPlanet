import React from 'react';
import Navigation from '../components/Navigation';
import LogoCardList from '../components/LogoCardList';
import ArchiveToolBar from '../components/ArchiveToolbar';

const MyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 items-center justify-center">
      {/* 헤더 */}
      <Navigation />

      {/* 메인 컨텐츠 */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 lg:px-12 text-center">

        {/* 타이틀 */}
        <h1 className="text-4xl lg:text-5xl font-bold text-white"> Archive </h1>

        {/* 도구 : sort, logo/poster, 검색창 */}
        <ArchiveToolBar />

        {/* 로고 리스트 */}
        <LogoCardList />


      </main> 



    </div>
  );
};

export default MyPage;

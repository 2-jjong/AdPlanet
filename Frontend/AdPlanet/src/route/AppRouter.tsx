import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import LogoPage from '../pages/LogoPage';
import PosterPage from '../pages/PosterPage';
import WatermarkDetectionPage from '../pages/WatermarkDetectionPage';
import ArchivePage from '../pages/ArchivePage';
import MyPage from "../pages/MyPage.tsx";

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/logo" element={<LogoPage />} />
        <Route path="/poster" element={<PosterPage />} />
        <Route path="/watermark-detection" element={<WatermarkDetectionPage />} />
        <Route path="/archive" element={<ArchivePage />} />
        <Route path="/mypage" element={<MyPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;

import React from 'react';
import AppRouter from './route/AppRouter';

// swiper 설정
import 'swiper/css';
import 'swiper/css/scrollbar';

// 프로젝트 색(#87DEDA)에 맞춘 스크롤바 커스텀
import "./styles/swiper-overrides.css";



function App() {
  return <AppRouter />;
}

export default App;
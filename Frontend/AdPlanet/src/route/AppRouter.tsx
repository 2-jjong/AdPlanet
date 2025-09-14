import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import LogoPage from '../pages/LogoPage';
import PosterPage from '../pages/PosterPage';
import WatermarkDetectionPage from '../pages/WatermarkDetectionPage';
import ArchivePage from '../pages/ArchivePage';
import MyPage from "../pages/MyPage.tsx";
import { PATHS } from '../constants/paths';

// 라우터 설정
const router = createBrowserRouter([
  {
    path: PATHS.HOME,
    element: <HomePage />,
  },
  {
    path: PATHS.LOGO,
    element: <LogoPage />,
  },
  {
    path: PATHS.POSTER,
    element: <PosterPage />,
  },
  {
    path: PATHS.WATERMARK_DETECTION,
    element: <WatermarkDetectionPage />,
  },
  {
    path: PATHS.ARCHIVE,
    element: <ArchivePage />,
  },
  {
    path: PATHS.MYPAGE,
    element: <MyPage />,
  },
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;

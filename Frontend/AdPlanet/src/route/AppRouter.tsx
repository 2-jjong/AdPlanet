import {createBrowserRouter, RouteObject, RouterProvider} from 'react-router-dom';
import HomePage from '../pages/HomePage';
import LogoPage from '../pages/LogoPage';
import PosterPage from '../pages/PosterPage';
import WatermarkDetectionPage from '../pages/WatermarkDetectionPage';
import ArchivePage from '../pages/ArchivePage';
import MyPage from "../pages/MyPage.tsx";
import AuthCallbackPage from '../pages/AuthCallbackPage';
import { PATHS } from '../constants/paths';

const routeConfig = [
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
  {
    path: PATHS.AUTH_CALLBACK,
    element: <AuthCallbackPage />,
  },
] as RouteObject[]
// 라우터 설정
const router = createBrowserRouter(routeConfig);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;

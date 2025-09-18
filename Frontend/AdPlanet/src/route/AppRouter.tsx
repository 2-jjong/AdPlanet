import {createBrowserRouter, RouteObject, RouterProvider, Navigate} from 'react-router-dom';
import HomePage from '../pages/HomePage';
import LogoPage from '../pages/LogoPage';
import LogoDetailPage from '../pages/LogoDetailPage';
import PosterPage from '../pages/PosterPage';
// import PosterDetailPage from '../pages/PosterDetailPage';
import WatermarkDetectionPage from '../pages/WatermarkDetectionPage';
import ArchivePage from '../pages/ArchivePage';
import LogoCardList from "../components/LogoCardList";
import PosterCardList from "../components/PosterCardList";
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
      children: [
        { index: true, element: <Navigate to="logo" replace /> }, // 기본 진입 /archive/logo
        { path: "logo",   element: <LogoCardList /> },
        { path: "poster", element: <PosterCardList /> },
    ],
  },
  { 
    path: "/archive/logo/:id",   
    element: <LogoDetailPage /> 
  },
  // { 
  //   path: "/archive/poster/:id", 
  //   element: <PosterDetailPage /> 
  // },

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

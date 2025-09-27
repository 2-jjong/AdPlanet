import { createBrowserRouter, type RouteObject, RouterProvider, Navigate } from "react-router-dom";
import HomePage from "../modules/Home/pages/HomePage";
import LogoDetailPage from "../modules/Mypage/pages/LogoDetailPage";
import PosterDetailPage from '../modules/Mypage/pages/PosterDetailPage';
import WatermarkDetectionPage from "../modules/Watermark/pages/WatermarkDetectionPage";
import GalleryPage from "../modules/Gallery/pages/GalleryPage";
import ArchivePage from "../modules/Mypage/pages/ArchivePage";
import { PATHS } from "../constants/paths";
import LogoPage from "../modules/Logo/pages/LogoPage";
import PosterPage from "../modules/Poster/pages/PosterPage";
import AuthCallbackPage from "../modules/Auth/pages/AuthCallbackPage";

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
    path: PATHS.GALLERY,
    element: <GalleryPage />,
  },
  {
    path: PATHS.ARCHIVE,
    element: <Navigate to="/archive/logo" replace />,
  },
  {
    path: "/archive/:kind",
    element: <ArchivePage />,
  },
  // 상세 페이지
  {
    path: "/archive/logo/:id",
    element: <LogoDetailPage />,
  },
  {
    path: "/archive/poster/:id",
    element: <PosterDetailPage />
  },

  {
    path: PATHS.AUTH_CALLBACK,
    element: <AuthCallbackPage />,
  },
] as RouteObject[];
// 라우터 설정
const router = createBrowserRouter(
  routeConfig
);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;

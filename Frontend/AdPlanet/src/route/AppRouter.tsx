import { createBrowserRouter, type RouteObject, RouterProvider, Navigate } from "react-router-dom";
import HomePage from "../modules/Home/pages/HomePage";
import LogoDetailPage from "../modules/Mypage/pages/LogoDetailPage";
// import PosterDetailPage from '../pages/PosterDetailPage';
import WatermarkDetectionPage from "../modules/Watermark/pages/WatermarkDetectionPage";
import ArchivePage from "../modules/Mypage/pages/ArchivePage";
// import PosterCardList from "../components/PosterCardList";
import { PATHS } from "../constants/paths";
import LogoPage from "../modules/Logo/pages/LogoPage";
import PosterPage from "../modules/Poster/pages/PosterPage";
import LogoCardList from "../modules/Mypage/components/LogoCardList";
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
    path: PATHS.ARCHIVE,
    element: <ArchivePage />,
    children: [
      { index: true, element: <Navigate to='logo' replace /> }, // 기본 진입 /archive/logo
      { path: "logo", element: <LogoCardList /> },
      // { path: "poster", element: <PosterCardList /> },
    ],
  },
  {
    path: "/archive/logo/:id",
    element: <LogoDetailPage />,
  },
  // {
  //   path: "/archive/poster/:id",
  //   element: <PosterDetailPage />
  // },

  {
    path: PATHS.AUTH_CALLBACK,
    element: <AuthCallbackPage />,
  },
] as RouteObject[];
// 라우터 설정
const router = createBrowserRouter(routeConfig);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;

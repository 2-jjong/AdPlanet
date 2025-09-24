import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { PATHS } from "../../constants/paths";

export default function PageTransitionLayout() {
  const location = useLocation();
  const from = (location.state as any)?.from; // 타입 엄격히 하려면 별도 선언

  // ★ 분기 조건: "목적지가 Home" && "from이 AuthCallback일 때만" 특수 애니메이션
  const isAuthToHome = location.pathname === PATHS.HOME && from === PATHS.AUTH_CALLBACK;

  const props = isAuthToHome
    ? {
        // Auth→Home 전용
        initial:  { opacity: 0, y: 16 },
        animate:  { opacity: 1, y: 0,  transition: { type: "spring", stiffness: 180, damping: 28, mass: 0.8 } },
        exit:     { opacity: 0.7, y: -12, transition: { type: "spring", stiffness: 240, damping: 26 } },
      }
    : {
        // 그 외 모든 전환(원래 Home 진입 포함)
        // initial:  { opacity: 0, scale: 0.985 },
        // animate:  { opacity: 1, scale: 1, transition: { type: "tween", duration: 0.4, ease: [0.2, 0.8, 0.2, 1] } },
        // exit:     { opacity: 0.7, scale: 1.005, transition: { type: "tween", duration: 0.25, ease: [0.4, 0, 1, 1] } },
        initial: { opacity: 0, filter: "blur(8px)" },
        animate: { opacity: 1, filter: "blur(0px)", transition: { duration: 0.45, ease: [0.2, 0.8, 0.2, 1] } },
        exit:    { opacity: 0.8, filter: "blur(0.4px)", transition: { duration: 0.3, ease: [0.4, 0, 1, 1] } },
      };

  return (
    // ✅ 겹쳐서 렌더(크로스 페이드) → 깜빡임 줄이기
    <div className="relative min-h-screen">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}              // 필요시 pathname+search
          className="absolute inset-0"
          {...props}
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

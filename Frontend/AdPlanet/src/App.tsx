import AppRouter from "./route/AppRouter";
import { AuthProvider } from "./contexts/AuthContext";

// swiper 설정
import "swiper/css";
import "swiper/css/scrollbar";

// 프로젝트 색(#87DEDA)에 맞춘 스크롤바 커스텀
import "./styles/swiper-overrides.css";
import { useEffect, useState } from "react";
import Welcome from "./modules/Welcome/Welcome";

function App() {
  const [showWelcom, setShowWelcome] = useState(true);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");
    if (hasSeenWelcome === "true") {
      setShowWelcome(false);
    }
  }, []);

  const handleWelcomeComplete = () => {
    localStorage.setItem("hasSeenWelcome", "true");
    setShowWelcome(false);
  };

  if (showWelcom) {
    return (
      <AuthProvider>
        <Welcome onStart={handleWelcomeComplete} />
      </AuthProvider>
    );
  }
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;

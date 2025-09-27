import { Canvas } from "@react-three/fiber";
import Stars from "../Home/components/Stars";
import { Button } from "../../components/UI/Button/Button";
import { RoundButton } from "../../components/UI/Button/RoundButton";
import { useState, useEffect } from "react";

interface WelcomeProps {
  onStart: () => void;
}

const Welcome = ({ onStart }: WelcomeProps) => {
  const [showFirstText, setShowFirstText] = useState<boolean>(true);
  const [showSecondContent, setShowSecondContent] = useState<boolean>(false);

  useEffect(() => {
    // 첫 번째 텍스트를 3초 동안 보여주기
    const firstTimer = setTimeout(() => {
      setShowFirstText(false);
    }, 3000);

    // 첫 번째 텍스트가 사라진 후 0.5초 뒤에 두 번째 텍스트 표시
    const secondTimer = setTimeout(() => {
      setShowSecondContent(true);
    }, 3500);

    return () => {
      clearTimeout(firstTimer);
      clearTimeout(secondTimer);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b font-jamsil">
      <div className="fixed top-0 left-0 w-full h-full">
        <Canvas>
          <Stars size={1} />
        </Canvas>
      </div>

      <div className="text-center space-y-8 p-8 z-10 relative">
        {/* 첫 번째 텍스트 */}
        {showFirstText && (
          <p className="text-3xl text-white text-center font-bold mb-8 max-w-md transition-opacity duration-500 ease-in-out opacity-100 animate-fadeIn leading-relaxed">
            AI와 함께하는 창의적인 광고 제작의 <br />
            새로운 세계로 떠나보세요.
          </p>
        )}

        {/* 두 번째 텍스트와 버튼 */}
        {showSecondContent && (
          <div className="animate-fadeIn">
            <p className="text-3xl text-white text-center font-bold mb-10 max-w-md leading-relaxed">
              당신의 아이디어를
              <br />
              현실로 만들어드립니다.
            </p>
            <Button
              text="AdPlanet으로 떠나기"
              variant="fill"
              size="md"
              onClick={onStart}
              className="animate-pulse"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Welcome;

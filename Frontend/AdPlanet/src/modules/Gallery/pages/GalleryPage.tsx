// GalleryPage.tsx
import Navigation from '../../../components/Layout/Navigation';
import GlassCardStack from '../components/GlassCardStack';
import Stars from "../../Home/components/Stars";
import { Canvas } from "@react-three/fiber";

const GalleryPage: React.FC = () => {
  return (
    <div className='' style={{ position: "relative", minHeight: "100dvh", overflow: "hidden" }}>
      <Navigation />
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 20,
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        paddingTop: "120px",
        pointerEvents: "none",
      }}
    >
    </div>

    <div>
        {/* 배경 Canvas (전체 화면 고정) */}
        <Canvas
          style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
          gl={{ alpha: true }}
          camera={{ position: [0, 0, 10], fov: 50 }}
          >
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} />
          <Stars size={3} />
        </Canvas>
      </div>

      {/* 전경: 부모 높이 100% 채움 */}
      <div style={{ height: "calc(100dvh - 64px)" }}>
        <GlassCardStack height="100%" />
      </div>
    </div>
  );
};

export default GalleryPage;

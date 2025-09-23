// src/modules/Gallery3D/GlassCardStack.tsx
import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ScrollControls, Environment } from "@react-three/drei";
import * as THREE from "three/src/Three.js"
import StackedPlanes from "./StackedPlanes";
import ImageModal from "./ImageModal";
import { DEFAULT_IMAGES } from "./ImageLoader.ts";
import { DEFAULT_DEPTH, DEFAULT_GAP, DEFAULT_TILT, OUTPUT_COLORSPACE } from "./options";

export type GalleryProps = {
  images?: string[];
  gap?: number;
  tilt?: number;
  depthStep?: number;
  height?: string;
};

export default function GlassCardStack({
  images = DEFAULT_IMAGES,
  gap = DEFAULT_GAP,
  tilt = DEFAULT_TILT,
  depthStep = DEFAULT_DEPTH,
  height = "100vh",
}: GalleryProps) {
  const [modalSrc, setModalSrc] = useState<string | null>(null);

  return (
    // ✅ 배경 컬러 제거(페이지에서만 관리)
    <div style={{ height, position: "relative" }}>
      <Canvas
        gl={{ outputColorSpace: OUTPUT_COLORSPACE, alpha: false }} // ← 투명 캔버스
        onCreated={({ gl }) => { gl.toneMapping = THREE.NoToneMapping; }}
      >
        {/* ❌ 배경색 지정 삭제: <color attach="background" ... /> */}

        <Environment preset="city" />

        <Suspense fallback={null}>
          <ScrollControls horizontal pages={Math.max(1, images.length / 3)} damping={0.12}>
            <StackedPlanes
              images={images}
              gap={gap}
              tilt={tilt}
              depthStep={depthStep}
              onSelect={(src) => setModalSrc(src)}
            />
          </ScrollControls>
        </Suspense>
      </Canvas>

      {modalSrc && <ImageModal src={modalSrc} onClose={() => setModalSrc(null)} />}
    </div>
  );
}

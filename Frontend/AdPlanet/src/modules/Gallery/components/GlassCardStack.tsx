// src/modules/Gallery3D/GlassCardStack.tsx
import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ScrollControls, Environment } from "@react-three/drei";
import * as THREE from "three";
import StackedPlanes from "./StackedPlanes";
import ImageModal from "./ImageModal";
import { DEFAULT_IMAGES } from "./ImageLoader";
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
    <div style={{ height, background: "#f6f7fb", position: "relative" }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{
          powerPreference: "high-performance",
          antialias: true,
          outputColorSpace: OUTPUT_COLORSPACE, // sRGB 고정
        }}
      >
        <color attach="background" args={["#f6f7fb"]} />
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

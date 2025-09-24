// src/modules/Gallery3D/GlassCardStack.tsx
import { Suspense, useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrthographicCamera } from "@react-three/drei";
import * as THREE from "three/src/Three.js"
import StackedPlanes from "./StackedPlanes";
import ImageModal from "./ImageModal";
import { DEFAULT_IMAGES } from "./imageLoader";
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
  const wrapRef = useRef<HTMLDivElement>(null);
  const [parentEl, setParentEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setParentEl(wrapRef.current ?? null);
  }, []);

  return (
    <div ref={wrapRef} style={{ height, position: "relative" }}>
      <Canvas
        gl={{
          outputColorSpace: OUTPUT_COLORSPACE,
          alpha: true,
          premultipliedAlpha: false,
          antialias: true,
          powerPreference: "high-performance"
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.NoToneMapping;
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }}
      >
        <OrthographicCamera
          makeDefault
          position={[0, 0, 10]}
          near={-1000}
          far={1000}
          zoom={120} // 화면 크기에 맞게 조절(카드 크기에 맞춰 줄임)
        />
        <Environment preset="city" />
        <Suspense fallback={null}>
          <StackedPlanes
            images={images}
            gap={gap}
            tilt={tilt}
            depthStep={depthStep}
            onSelect={(src) => setModalSrc(src)}
            canvasParent={parentEl}
          />
        </Suspense>
      </Canvas>

      {modalSrc && <ImageModal src={modalSrc} onClose={() => setModalSrc(null)} />}
    </div>
  );
}

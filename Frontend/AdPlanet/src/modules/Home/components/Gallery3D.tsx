import * as THREE from "three";
import { MathUtils, SRGBColorSpace, Mesh } from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { ScrollControls, useScroll, useTexture, Environment } from "@react-three/drei";
import { EffectComposer, DepthOfField, Bloom, Vignette } from "@react-three/postprocessing";
import { Suspense, useMemo, useRef, useState } from "react";


// 폴더 내 jpg/png/webp 전부 가져오기 (Vite 전용)
const modules = import.meta.glob("/src/assets/gallery/*.{jpg,jpeg,png,webp}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

// 파일명 기준 정렬해서 이미지 배열 생성
const DEFAULT_IMAGES = Object.entries(modules)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([, url]) => url);

// ---- 아래는 기존 코드에서 props 기본값만 바꿔주면 끝 ----
type GalleryProps = {
  images?: string[];   // 선택 입력
  gap?: number;
  tilt?: number;
  depthStep?: number;
  height?: string;
};

export default function Gallery3D({
  images = DEFAULT_IMAGES,   // ⬅️ 기본값으로 내부 이미지를 사용
  gap = 3.2,
  tilt = -0.35,
  depthStep = -0.45,
  height = "100vh",
}: GalleryProps) {
  return (
    <div style={{ height: "100vh", background: "#f6f7fb" }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <color attach="background" args={["#f6f7fb"]} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 5, 5]} intensity={1.2} />

        <Suspense fallback={null}>
          {/* 스크롤 길이를 이미지 수에 맞춰 설정 (pages = 전체 길이/뷰포트 너비 개념) */}
          <ScrollControls horizontal pages={Math.max(1, images.length / 3)} damping={0.15}>
            <StackedPlanes images={images} gap={gap} tilt={tilt} depthStep={depthStep} />
          </ScrollControls>

          {/* 환경맵 약간만 추가해서 반사/광택 느낌 */}
          <Environment preset="city" />
          <EffectComposer>
            {/* 원근 흐림 (앞/뒤 살짝 흐릿) */}
            <DepthOfField focusDistance={0.015} focalLength={0.028} bokehScale={2.0} />
            <Bloom intensity={0.15} />
            <Vignette eskil={false} offset={0.1} darkness={0.9} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}

function StackedPlanes({
  images, gap, tilt, depthStep,
}: Required<Pick<GalleryProps, "images" | "gap" | "tilt" | "depthStep">>) {
  const group = useRef<THREE.Group>(null);
  const scroll = useScroll();

  // 이미지Plane 데이터 미리 계산
  const planes = useMemo(() => {
    return images.map((src, i) => ({
      src,
      x: i * gap,             // x로 벌려 놓고,
      z: i * depthStep,       // z로 살짝씩 뒤로
      rotY: tilt,             // 전체 동일한 기울기
    }));
  }, [images, gap, depthStep, tilt]);

  // 스크롤 → 그룹 전체를 -x 방향으로 이동 (부드럽게 보간)
  useFrame((_state, delta) => {
    if (!group.current) return;
    const totalWidth = (images.length - 1) * gap;
    const targetX = -scroll.offset * totalWidth;
    group.current.position.x = THREE.MathUtils.damp(group.current.position.x, targetX, 4, delta);
  });

  return (
    <group ref={group} position={[-1.5, 0, 0]}>
      {planes.map((p, i) => (
        <ImagePlane key={i} {...p} />
      ))}
    </group>
  );
}

function ImagePlane({
  src, x, z, rotY,
}: { src: string; x: number; z: number; rotY: number }) {
  const tex = useTexture(src);
  tex.colorSpace = THREE.SRGBColorSpace;

  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_s, delta) => {
    if (!meshRef.current) return;
    // hover 시 살짝 확대 + 회전 보간
    const targetScale = hovered ? 1.05 : 1;
    meshRef.current.scale.x = THREE.MathUtils.damp(meshRef.current.scale.x, targetScale, 6, delta);
    meshRef.current.scale.y = THREE.MathUtils.damp(meshRef.current.scale.y, targetScale, 6, delta);

    const targetRotY = hovered ? rotY + 0.05 : rotY;
    meshRef.current.rotation.y = THREE.MathUtils.damp(meshRef.current.rotation.y, targetRotY, 6, delta);
  });

  return (
    <mesh
      ref={meshRef}
      position={[x, 0, z]}
      rotation={[0, rotY, 0]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* 비율 맞추려면 planeGeometry를 이미지 비율에 맞게 조정 */}
      <planeGeometry args={[3.2, 4.8]} />
      <meshPhysicalMaterial
        map={tex}
        roughness={0.8}
        metalness={0.1}
        clearcoat={0.5}
        transparent
        opacity={0.96}
      />
    </mesh>
  );
}

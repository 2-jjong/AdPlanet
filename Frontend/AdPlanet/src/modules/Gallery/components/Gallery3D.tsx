import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ScrollControls, useScroll, useTexture } from "@react-three/drei";
import { EffectComposer, DepthOfField, Bloom, Vignette } from "@react-three/postprocessing";

// three: 타입/상수 개별 임포트 (네임스페이스 타입 오류 회피)
import {
  MathUtils,
  SRGBColorSpace,
  LinearMipmapLinearFilter,
  LinearFilter,
  PlaneGeometry,
  // 타입
} from "three";
import type { Group, Mesh, Texture } from "three";

// =========================
// 🔧 토글 가능한 품질/성능 옵션
// =========================
const USE_POSTPROCESSING = true;      // 필요 없으면 false
const POST_RESOLUTION_SCALE = 0.75;   // 0.6~0.85 권장
const DPR_RANGE: [number, number] = [1, 1.5]; // 레티나에서도 1.5까지만
const USE_BASIC_MATERIAL = true;      // true면 라이트/환경맵 제거 가능
const ANISOTROPY = 2;                 // 0~4 권장

// =========================
// 이미지 자동 로딩 (Vite 전용)
// =========================
const modules = import.meta.glob("/src/assets/gallery/*.{jpg,jpeg,png,webp,avif}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const DEFAULT_IMAGES = Object.entries(modules)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([, url]) => url);

type GalleryProps = {
  images?: string[];
  gap?: number;
  tilt?: number;
  depthStep?: number;
  height?: string;
};

export default function Gallery3D({
  images = DEFAULT_IMAGES,
  gap = 3.2,
  tilt = -0.35,
  depthStep = -0.45,
  height = "100vh",
}: GalleryProps) {
  return (
    <div style={{ height, background: "#f6f7fb" }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        dpr={DPR_RANGE}
        gl={{ powerPreference: "high-performance", antialias: true }}
        // frameloop="demand"  // ↙️ 고급 최적화 시 onScroll/hover에서 invalidate() 사용
      >
        <color attach="background" args={["#f6f7fb"]} />

        {/* 라이트는 meshBasicMaterial이면 불필요 → 토글 */}
        {!USE_BASIC_MATERIAL && (
          <>
            <ambientLight intensity={0.6} />
            <directionalLight position={[3, 5, 5]} intensity={1.0} />
          </>
        )}

        <Suspense fallback={null}>
          <ScrollControls horizontal pages={Math.max(1, images.length / 3)} damping={0.12}>
            <StackedPlanes
              images={images}
              gap={gap}
              tilt={tilt}
              depthStep={depthStep}
            />
          </ScrollControls>

          {/* 후처리: 비용이 크므로 필요 시만 */}
          {USE_POSTPROCESSING && (
            <EffectComposer multisampling={0} resolutionScale={POST_RESOLUTION_SCALE}>
              <DepthOfField focusDistance={0.015} focalLength={0.022} bokehScale={1.6} />
              <Bloom intensity={0.1} />
              <Vignette eskil={false} offset={0.1} darkness={0.9} />
            </EffectComposer>
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}

function StackedPlanes({
  images, gap, tilt, depthStep,
}: Required<Pick<GalleryProps, "images" | "gap" | "tilt" | "depthStep">>) {
  const group = useRef<Group>(null);
  const scroll = useScroll();

  // 같은 사이즈 planeGeometry를 공유하여 메모리/생성비용 절감
  const sharedPlaneGeom = useMemo(() => new PlaneGeometry(3.2, 4.8), []);
  // 언마운트 시 dispose
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // useEffect(() => () => sharedPlaneGeom.dispose(), [sharedPlaneGeom]);

  const planes = useMemo(
    () =>
      images.map((src, i) => ({
        src,
        x: i * gap,
        z: i * depthStep,
        rotY: tilt,
      })),
    [images, gap, depthStep, tilt]
  );

  useFrame((_state, delta) => {
    if (!group.current) return;
    const totalWidth = (images.length - 1) * gap;
    const targetX = -scroll.offset * totalWidth;
    // 감쇠 조금 키워서 빨리 안정화 → 렌더링 프레임 수 감소
    group.current.position.x = MathUtils.damp(group.current.position.x, targetX, 6, delta);
  });

  return (
    <group ref={group} position={[-1.5, 0, 0]}>
      {planes.map((p, i) => (
        <ImagePlane
          key={i}
          src={p.src}
          x={p.x}
          z={p.z}
          rotY={p.rotY}
          sharedGeom={sharedPlaneGeom}
        />
      ))}
    </group>
  );
}

function ImagePlane({
  src, x, z, rotY, sharedGeom,
}: { src: string; x: number; z: number; rotY: number; sharedGeom: PlaneGeometry }) {
  const tex = useTexture(src) as Texture;
  // 텍스처 필터/컬러스페이스 최적화
  tex.colorSpace = SRGBColorSpace;
  tex.generateMipmaps = true;
  tex.minFilter = LinearMipmapLinearFilter;
  tex.magFilter = LinearFilter;
  tex.anisotropy = ANISOTROPY;

  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const { invalidate } = useThree(); // frameloop="demand"를 쓸 경우 활성화

  useFrame((_s, delta) => {
    if (!meshRef.current) return;

    const targetScale = hovered ? 1.05 : 1;
    meshRef.current.scale.x = MathUtils.damp(meshRef.current.scale.x, targetScale, 6, delta);
    meshRef.current.scale.y = MathUtils.damp(meshRef.current.scale.y, targetScale, 6, delta);

    const targetRotY = hovered ? rotY + 0.05 : rotY;
    meshRef.current.rotation.y = MathUtils.damp(meshRef.current.rotation.y, targetRotY, 6, delta);
  });

  const onOver = () => {
    setHovered(true);
    // invalidate(); // frameloop="demand" 사용하는 경우 주석 해제
  };
  const onOut = () => {
    setHovered(false);
    // invalidate();
  };

  return (
    <mesh
      ref={meshRef}
      position={[x, 0, z]}
      rotation={[0, rotY, 0]}
      onPointerOver={onOver}
      onPointerOut={onOut}
      frustumCulled
    >
      {/* 공유 지오메트리 사용 */}
      <primitive object={sharedGeom} attach="geometry" />

      {/* 가벼운 머티리얼로 교체 (라이트 계산 X) */}
      {USE_BASIC_MATERIAL ? (
        <meshBasicMaterial map={tex} />
      ) : (
        // 혹시 약간의 조명이 필요하면 이걸로
        // <meshStandardMaterial map={tex} roughness={1} metalness={0} />
        <meshBasicMaterial map={tex} />
      )}
    </mesh>
  );
}

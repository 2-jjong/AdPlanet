// src/modules/Gallery3D/GlassCard.tsx
import * as THREE from "three/src/Three.js"
import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture, useCursor } from "@react-three/drei";
import EdgeBlurOverlay from "./EdgeBlurOverlay";
import GlassFrame from "./GlassFrame";
import {
  CARD_W, CARD_H, CARD_D, MAX_ANISOTROPY,
  FADE_RADIUS, MIN_OPACITY, SHOW_FRAME, SHOW_BACKPLATE,
  HOVER_FLATTEN, HOVER_SCALE, HOVER_DAMP,
} from "./options";
import Backplate from "./Backplate";

type Props = {
  index: number;
  total: number;
  center: number;
  src: string;
  x: number;
  y?: number;
  z: number;
  rotY: number;
  sharedGeom: THREE.PlaneGeometry;
  onSelect: (src: string) => void;
};

export default function GlassCard({
  index, center, src, x, y = 0, z, rotY, sharedGeom, onSelect,
}: Props) {
  const tex = useTexture(src) as THREE.Texture;

  // 텍스처 세팅
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.anisotropy = MAX_ANISOTROPY;

  // --- object-fit: cover 계산 ---
  const { uvScale, uvOffset } = useMemo(() => {
    const iw = (tex.image as any)?.width ?? 1;
    const ih = (tex.image as any)?.height ?? 1;
    const texAspect = iw / ih;
    const cardAspect = CARD_W / CARD_H;

    // cover: 더 넓은 축을 잘라낸다
    if (texAspect > cardAspect) {
      // 텍스처가 더 가로로 넓음 → X를 축소해서 가운데만 보이게
      const sx = cardAspect / texAspect; // < 1
      return { uvScale: [sx, 1] as [number, number], uvOffset: [(1 - sx) / 2, 0] as [number, number] };
    } else {
      // 텍스처가 더 세로로 김 → Y를 축소
      const sy = texAspect / cardAspect; // < 1
      return { uvScale: [1, sy] as [number, number], uvOffset: [0, (1 - sy) / 2] as [number, number] };
    }
  }, [tex.image]);

  const groupRef = useRef<THREE.Group>(null);
  const posterMeshRef = useRef<THREE.Mesh>(null);
  const frameRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered, "pointer", "auto");

  useFrame((_s, dt) => {
    if (!groupRef.current) return;

    const dist = Math.abs(index - center);
    const t = Math.max(0, 1 - dist / FADE_RADIUS);
    const opacityForCard = MIN_OPACITY + (1 - MIN_OPACITY) * t;

    const mat = posterMeshRef.current?.material as THREE.ShaderMaterial | undefined;
    if (mat && (mat as any).uniforms?.uOpacity) {
      mat.uniforms.uOpacity.value = 0.98 * opacityForCard;
    }

    // 향상된 호버 효과 - 스케일과 틸팅
    const targetScale = hovered ? HOVER_SCALE : 1;
    groupRef.current.scale.x = THREE.MathUtils.damp(groupRef.current.scale.x, targetScale, HOVER_DAMP, dt);
    groupRef.current.scale.y = THREE.MathUtils.damp(groupRef.current.scale.y, targetScale, HOVER_DAMP, dt);

    // 틸팅을 정면으로 부드럽게 변화
    const targetRotY = hovered ? rotY * (1 - HOVER_FLATTEN) : rotY;
    groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, targetRotY, HOVER_DAMP, dt);

  });

  return (
    <group ref={groupRef} position={[x, y, z]} rotation={[0, rotY, 0]}>
      {SHOW_BACKPLATE && (
        <group position={[0, 0, +CARD_D * 0.505]}>
          <Backplate renderOrder={0} />
        </group>
      )}

      <mesh
        ref={posterMeshRef}
        position={[0, 0, +CARD_D * 0.51]}
        renderOrder={1}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => onSelect(src)}
      >
        <primitive object={sharedGeom} attach="geometry" />
        <EdgeBlurOverlay
          map={tex}
          inner={0.80}
          outer={1.00}
          power={1.8}
          opacity={1.5}
          corner={0.025}
          shrink={0.006}
          uvScale={uvScale}
          uvOffset={uvOffset}
        />
      </mesh>

      {SHOW_FRAME && (
        <group ref={frameRef}>
          <GlassFrame />
        </group>
      )}
    </group>
  );
}

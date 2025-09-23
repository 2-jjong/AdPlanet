// src/modules/Gallery3D/GlassCard.tsx
// 유리 카드 + 사진 + 테두리 블러

import * as THREE from "three";
import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useScroll, useTexture, useCursor } from "@react-three/drei";
import EdgeBlurOverlay from "./EdgeBlurOverlay";
import GlassFrame from "./GlassFrame";
import {
  CARD_W, CARD_D, MAX_ANISOTROPY,
  FADE_RADIUS, MIN_OPACITY,
  EDGE_BLUR_INNER, EDGE_BLUR_OUTER, EDGE_BLUR_POWER, EDGE_BLUR_PX, EDGE_BLUR_STRENGTH,
  SHOW_FRAME,
} from "./options";

type Props = {
  index: number;
  total: number;
  src: string;
  x: number;
  z: number;
  rotY: number;
  sharedGeom: THREE.PlaneGeometry;
  onSelect: (src: string) => void;
};

export default function GlassCard({
  index, total, src, x, z, rotY, sharedGeom, onSelect,
}: Props) {
  const tex = useTexture(src) as THREE.Texture;

  // ✅ 텍스처 선명도
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.anisotropy = MAX_ANISOTROPY;

  const groupRef = useRef<THREE.Group>(null);
  const scroll = useScroll();
  const [hovered, setHovered] = useState(false);
  useCursor(hovered, "pointer", "auto");

  // 스크롤 페이드
  let opacityForCard = 1;
  useFrame((_s, dt) => {
    if (!groupRef.current) return;
    const center = scroll.offset * (total - 1);
    const dist = Math.abs(index - center);
    const t = Math.max(0, 1 - dist / FADE_RADIUS);
    opacityForCard = MIN_OPACITY + (1 - MIN_OPACITY) * t;

    // 호버 인터랙션
    const targetScale = hovered ? 1.05 : 1;
    groupRef.current.scale.x = THREE.MathUtils.damp(groupRef.current.scale.x, targetScale, 6, dt);
    groupRef.current.scale.y = THREE.MathUtils.damp(groupRef.current.scale.y, targetScale, 6, dt);
    const targetRotY = hovered ? rotY + 0.05 : rotY;
    groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, targetRotY, 6, dt);
  });

  return (
    <group ref={groupRef} position={[x, 0, z]} rotation={[0, rotY, 0]}>
      {/* 1) 사진(앞면) — “사진 그 자체” 테두리 블러 */}
      <mesh
        position={[0, 0, +CARD_D * 0.51]}
        renderOrder={2}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => onSelect(src)}
      >
        <primitive object={sharedGeom} attach="geometry" />
        <EdgeBlurOverlay
          map={tex}
          inner={EDGE_BLUR_INNER}             // 블러 시작 반경
          outer={EDGE_BLUR_OUTER}             // 블러 최대 반경
          power={EDGE_BLUR_POWER}             // 마스크 곡선
          blurPx={EDGE_BLUR_PX}               // 블러 반경(px)
          strength={EDGE_BLUR_STRENGTH}       // 섞는 비율
          opacity={0.98 * opacityForCard}     // 스크롤 페이드와 연동
          aspect={CARD_W / (CARD_D ? (CARD_D * 0 + 1) : 1) * (CARD_W / (4.8))} // 안전한 값(= CARD_W / CARD_H)
        />
      </mesh>

      {/* 2) [선택] 프레임(뒤) — 프레임은 변경 없음 */}
      {SHOW_FRAME && <GlassFrame />}
    </group>
  );
}

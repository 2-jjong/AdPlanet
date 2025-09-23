// src/modules/Gallery3D/GlassCard.tsx
// 유리 카드 + 사진 + 테두리 블러

import * as THREE from "three/src/Three.js"
import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useScroll, useTexture, useCursor } from "@react-three/drei";
import EdgeBlurOverlay from "./EdgeBlurOverlay";
import GlassFrame from "./GlassFrame";
import {
  CARD_W, CARD_H, CARD_D, MAX_ANISOTROPY,
  FADE_RADIUS, MIN_OPACITY,
  SHOW_FRAME,SHOW_BACKPLATE
} from "./options";
import Backplate from "./Backplate";

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

  // 텍스처 선명도
  tex.colorSpace = (THREE as any).LinearSRGBColorSpace ?? THREE.SRGBColorSpace;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.anisotropy = MAX_ANISOTROPY;

  const groupRef = useRef<THREE.Group>(null);
  const posterMeshRef = useRef<THREE.Mesh>(null); // uOpacity 유니폼 갱신용
  const scroll = useScroll();
  const [hovered, setHovered] = useState(false);
  useCursor(hovered, "pointer", "auto");

  // 스크롤 페이드
  useFrame((_s, dt) => {
    if (!groupRef.current) return;

    const center = scroll.offset * (total - 1);
    const dist = Math.abs(index - center);
    const t = Math.max(0, 1 - dist / FADE_RADIUS);
    const opacityForCard = MIN_OPACITY + (1 - MIN_OPACITY) * t;

    // uOpacity 실시간 갱신(리렌더 없이 부드럽게)
    const mat = posterMeshRef.current?.material as THREE.ShaderMaterial | undefined;
    if (mat && (mat as any).uniforms?.uOpacity) {
      mat.uniforms.uOpacity.value = 0.98 * opacityForCard;
    }

    // 호버 인터랙션
    const targetScale = hovered ? 1.05 : 1;
    groupRef.current.scale.x = THREE.MathUtils.damp(groupRef.current.scale.x, targetScale, 6, dt);
    groupRef.current.scale.y = THREE.MathUtils.damp(groupRef.current.scale.y, targetScale, 6, dt);
    const targetRotY = hovered ? rotY + 0.05 : rotY;
    groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, targetRotY, 6, dt);
  });
  
  return (
    <group ref={groupRef} position={[x, 0, z]} rotation={[0, rotY, 0]}>
      {/* 0) 백플레이트: 먼저 그림 */}
      {SHOW_BACKPLATE && (
        <group position={[0, 0, +CARD_D * 0.505]}>
          <Backplate renderOrder={0} />
        </group>
      )}

      {/* 1) 사진: 나중에 그림(위에 올라오게) */}
      <mesh
        ref={posterMeshRef}
        position={[0, 0, +CARD_D * 0.51]}
        renderOrder={1} // 사진이 항상 백플레이트 위에
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => onSelect(src)}
      >
        <primitive object={sharedGeom} attach="geometry" />
        {/* EdgeBlurOverlay는 depthWrite=false라 순서가 중요 */}
        <EdgeBlurOverlay
          map={tex}
          inner={0.80}  // 테두리 투명 시작
          outer={1.00}  // 투명 최대
          power={1.8}   // 곡선
          opacity={1.5} // 스크롤 페이드는 useFrame에서 uOpacity로 갱신
          corner={0.025} // 프레임 둥근 정도에 맞추고 싶으면 0~0.3 정도 권장
          shrink={0.006}   // 테두리 없애기
        />

      </mesh>

      {/* 2) 프레임: 더 뒤쪽(선택) */}
      {SHOW_FRAME && <GlassFrame /* 필요하면 renderOrder={-1} */ />}
    </group>
  );
}

// src/modules/Gallery3D/GlassCard.tsx
// 유리 카드 컴포넌트

import * as THREE from "three/src/Three.js"
import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture, useCursor } from "@react-three/drei";
import EdgeBlurOverlay from "./EdgeBlurOverlay";
import GlassFrame from "./GlassFrame";
import {
  CARD_W, CARD_H, CARD_D, MAX_ANISOTROPY,
  FADE_RADIUS, MIN_OPACITY, SHOW_FRAME,
  HOVER_FLATTEN, HOVER_SCALE, HOVER_DAMP, HOVER_PULL,
} from "./options";

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
  index, center, src, x, y = 0, z, rotY, onSelect,
}: Props) {
  const tex = useTexture(src) as THREE.Texture;

  // 텍스처 세팅
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.anisotropy = MAX_ANISOTROPY;

  // 이미지 비율에 맞춘 카드 크기와 UV 계산
  const { cardWidth, cardHeight, uvScale, uvOffset } = useMemo(() => {
    const iw = (tex.image as any)?.width ?? 1;
    const ih = (tex.image as any)?.height ?? 1;
    const texAspect = iw / ih;
    const maxCardSize = Math.max(CARD_W, CARD_H);

    // 이미지 비율에 맞춰 카드 크기 조정
    let newCardW, newCardH;
    if (texAspect > 1) {
      // 가로가 긴 이미지
      newCardW = maxCardSize;
      newCardH = maxCardSize / texAspect;
    } else {
      // 세로가 긴 이미지 또는 정사각형
      newCardW = maxCardSize * texAspect;
      newCardH = maxCardSize;
    }

    // UV는 전체 이미지를 보여주도록 (contain 방식)
    return {
      cardWidth: newCardW,
      cardHeight: newCardH,
      uvScale: [1, 1] as [number, number],
      uvOffset: [0, 0] as [number, number]
    };
  }, [tex.image]);

  const groupRef = useRef<THREE.Group>(null);
  const posterMeshRef = useRef<THREE.Mesh>(null);
  const frameRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered, "pointer", "auto");

  // 이미지 비율에 맞춘 개별 지오메트리 생성
  const cardGeometry = useMemo(() => new THREE.PlaneGeometry(cardWidth, cardHeight), [cardWidth, cardHeight]);

  useFrame((_s, dt) => {
    if (!groupRef.current) return;

    const dist = Math.abs(index - center);
    const t = Math.max(0, 1 - dist / FADE_RADIUS);
    const opacityForCard = MIN_OPACITY + (1 - MIN_OPACITY) * t;

    const mat = posterMeshRef.current?.material as THREE.ShaderMaterial | undefined;
    if (mat && (mat as any).uniforms?.uOpacity) {
      mat.uniforms.uOpacity.value = 0.98 * opacityForCard;
    }

    // 호버 효과 - 스케일, 틸팅, 그리고 X축 이동
    const targetScale = hovered ? HOVER_SCALE : 1;
    groupRef.current.scale.x = THREE.MathUtils.damp(groupRef.current.scale.x, targetScale, HOVER_DAMP, dt);
    groupRef.current.scale.y = THREE.MathUtils.damp(groupRef.current.scale.y, targetScale, HOVER_DAMP, dt);

    // 틸팅을 정면으로 부드럽게 변화
    const targetRotY = hovered ? rotY * (1 - HOVER_FLATTEN) : rotY;
    groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, targetRotY, HOVER_DAMP, dt);

    // X축 이동으로 책을 뽑는 효과
    const targetX = hovered ? x + HOVER_PULL : x;
    groupRef.current.position.x = THREE.MathUtils.damp(groupRef.current.position.x, targetX, HOVER_DAMP, dt);

  });

  return (
    <group ref={groupRef} position={[x, y, z]} rotation={[0, rotY, 0]}>

      {/* 포스터 메쉬 */}
      <mesh
        ref={posterMeshRef}
        position={[0, 0, +CARD_D * 0.51]}
        renderOrder={1}
        onPointerOver={(e: { stopPropagation: () => void; }) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={(e: { stopPropagation: () => void; }) => {
          e.stopPropagation();
          setHovered(false);
        }}
        onClick={(e: { stopPropagation: () => void; }) => {
          e.stopPropagation();
          onSelect(src);
        }}
      >
        <primitive object={cardGeometry} attach="geometry" />
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
          <GlassFrame width={cardWidth} height={cardHeight} />
        </group>
      )}
    </group>
  );
}

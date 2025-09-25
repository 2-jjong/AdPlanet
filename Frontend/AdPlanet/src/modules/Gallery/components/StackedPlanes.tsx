// src/modules/Gallery3D/StackedPlanesInfinite.tsx
import * as THREE from "three/src/Three.js";
import { useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import GlassCard from "./GlassCard";
import { CARD_W, CARD_H } from "./options";
import { useInfiniteScroller } from "../hooks/mutation/useInfiniteScroller";

type Props = {
  images: string[];
  gap: number;
  tilt: number;
  depthStep: number;
  onSelect: (src: string) => void;
  canvasParent?: HTMLElement | null;
};

export default function StackedPlanesInfinite({
  images, gap, tilt, depthStep, onSelect, canvasParent,
}: Props) {
  const group = useRef<THREE.Group>(null);
  const { gl, viewport } = useThree();

  const M = images.length;
  const posRef = useRef(0);              // 절대 스크롤(월드 x)
  const [center, setCenter] = useState(0); // 카드 인덱스 단위(소수)

  // 입력: 휠/드래그 + 관성
  useInfiniteScroller(canvasParent ?? gl.domElement.parentElement, {
    onChange: (p) => { posRef.current = p; setCenter(p / gap); },
    friction: 0.9,
    wheelSpeed: 0.8,
    dragSpeed: 1.0,
  });

  // 화면을 채우기에 필요한 "동시 카드 개수" 계산 (뷰포트 폭 + 버퍼)
  // Ortho에선 viewport.width가 월드단위 폭
  const visibleWindow = useMemo(() => {
    const half = viewport.width * 0.5;
    const buffer = Math.max(2 * gap, 2 * CARD_W); // 여유
    const totalWidth = viewport.width + 2 * buffer;
    const count = Math.ceil(totalWidth / gap) + 2; // 한쪽에 1~2장 버퍼
    return { half, buffer, count };
  }, [viewport.width, gap]);

  // 스크롤에 따라 카드 위치가 변화하는 스택 레이아웃
  const items = useMemo(() => {
    const stackSize = 8; // 화면에 보이는 카드 수
    const iCenter = Math.floor(center);
    const offset = center - iCenter; // 소수점 부분 (애니메이션용)
    const arr: { i: number; imgIndex: number; src: string; x: number; y: number; z: number; rotY: number }[] = [];

    for (let stackIndex = 0; stackIndex < stackSize; stackIndex++) {
      const i = iCenter + stackIndex;                   // 가상 인덱스(무한대)
      const imgIndex = ((i % M) + M) % M;               // 원본 이미지 인덱스

      // 애니메이션을 위한 위치 계산: 스크롤에 따라 앞으로 이동
      const animatedIndex = stackIndex - offset;

      // 스택 중심을 화면 중앙에 맞추기 위한 오프셋 계산
      const centerOffset = (stackSize - 1) / 2;

      arr.push({
        i,
        imgIndex,
        src: images[imgIndex],
        x: (animatedIndex - centerOffset) * 1.2,  // 중앙 정렬
        y: (animatedIndex - centerOffset) * 0.6,  // 중앙 정렬
        z: -animatedIndex * 1.2,  // z축은 그대로 (깊이감 유지)
        rotY: tilt,
      });
    }
    return arr;
  }, [center, images, M, tilt]);

  // 카드 스택은 고정 위치 유지 (그룹 이동 제거)
  useFrame(() => {
    // 카드 위치는 고정하고 스크롤 시 이미지만 변경
  });

  // 공유 PlaneGeometry (루프 밖 1회 생성)
  const sharedPlaneGeom = useMemo(() => new THREE.PlaneGeometry(CARD_W, CARD_H), []);

  return (
    <group ref={group} position={[0, 0, 0]}>
      {items.map((p) => (
        <GlassCard
          key={p.i}
          index={p.i}            // center와의 거리 계산용(연속)
          total={M}
          center={center}
          src={p.src}
          x={p.x}
          y={p.y}
          z={p.z}
          rotY={p.rotY}
          sharedGeom={sharedPlaneGeom}
          onSelect={onSelect}
        />
      ))}
    </group>
  );
}

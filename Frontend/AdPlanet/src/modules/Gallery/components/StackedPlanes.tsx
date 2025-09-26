// src/modules/Gallery3D/StackedPlanes.tsx
// 화면 중앙에 카드 스택을 배치하고 스크롤에 따라 움직이기

import * as THREE from "three/src/Three.js";
import { useMemo, useRef, useState } from "react";
import { useThree } from "@react-three/fiber";
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
  images, gap, tilt, onSelect, canvasParent,
}: Props) {
  const group = useRef<THREE.Group>(null);
  const { gl } = useThree();

  const M = images.length;
  const posRef = useRef(0);              // 절대 스크롤
  const [center, setCenter] = useState(0); // 카드 인덱스 

  // 입력: 휠/드래그 + 관성
  useInfiniteScroller(canvasParent ?? gl.domElement.parentElement, {
    onChange: (p) => { posRef.current = p; setCenter(p / gap); },
    friction: 0.9,
    wheelSpeed: 0.8,
    dragSpeed: 1.0,
  });

  // 스크롤에 따라 카드 위치가 변화하는 스택 레이아웃
  const items = useMemo(() => {
    const stackSize = 6; // 화면에 보이는 카드 수
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
        // 카드 간격(gap)과 뎁스(depthStep) 조절
        x: (animatedIndex - centerOffset) * 1.9,  // 중앙 정렬
        y: (animatedIndex - centerOffset) * 1.0,  // 중앙 정렬
        z: -animatedIndex * 0.8,  // z축 깊이감 유지
        rotY: tilt,
      });
    }
    return arr;
  }, [center, images, M, tilt]);

  // 공유 PlaneGeometry (사진 비율에 맞춰 넣기 위함)
  const sharedPlaneGeom = useMemo(() => new THREE.PlaneGeometry(CARD_W, CARD_H), []);

  return (
    <group ref={group} position={[2, 0, 7]}>
      {items.map((p) => (
        <GlassCard
          key={p.i}
          index={p.i}            // center와의 거리 계산용
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

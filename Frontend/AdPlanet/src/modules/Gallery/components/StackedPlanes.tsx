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

  // center를 기준으로 [-N, +N] 가상 인덱스(i)를 만들고, 각 i를 이미지 k로 매핑
  const items = useMemo(() => {
    const N = visibleWindow.count;
    const iCenter = Math.floor(center);
    const arr: { i: number; imgIndex: number; src: string; x: number; z: number; rotY: number }[] = [];
    for (let di = -N; di <= N; di++) {
      const i = iCenter + di;                           // 가상 인덱스(무한대)
      const imgIndex = ((i % M) + M) % M;               // 원본 이미지 인덱스
      arr.push({
        i,
        imgIndex,
        src: images[imgIndex],
        x: i * gap,
        z: i * depthStep,
        rotY: tilt,
      });
    }
    return arr;
  }, [center, images, M, gap, depthStep, tilt, visibleWindow.count]);

  // 그룹 이동 — 즉시 반영(래깅 제거)
  useFrame(() => {
    if (!group.current) return;
    group.current.position.x = -posRef.current;
  });

  // 공유 PlaneGeometry (루프 밖 1회 생성)
  const sharedPlaneGeom = useMemo(() => new THREE.PlaneGeometry(CARD_W, CARD_H), []);

  return (
    <group ref={group} position={[-1.5, 0, 0]}>
      {items.map((p) => (
        <GlassCard
          key={p.i}
          index={p.i}            // center와의 거리 계산용(연속)
          total={M}
          center={center}
          src={p.src}
          x={p.x}
          z={p.z}
          rotY={p.rotY}
          sharedGeom={sharedPlaneGeom}
          onSelect={onSelect}
        />
      ))}
    </group>
  );
}

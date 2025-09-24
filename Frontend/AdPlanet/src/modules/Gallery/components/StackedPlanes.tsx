// src/modules/Gallery3D/StackedPlanesInfinite.tsx
import * as THREE from "three/src/Three.js";
import { useEffect, useMemo, useRef, useState } from "react";
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
  const period = M * gap;

  // 절대 스크롤 값
  const posRef = useRef(0);
  const [center, setCenter] = useState(0);

  useInfiniteScroller(canvasParent ?? gl.domElement.parentElement, {
    onChange: (p) => { posRef.current = p; setCenter(p / gap); },
    friction: 0.92, wheelSpeed: 1.0, dragSpeed: 1.0,
  });

  // 각 카드의 "현재 밴드 오프셋"을 관리 (…,-1,0,+1,…) => x = (k + band*M)*gap
  const bandsRef = useRef<number[]>([]);
  if (bandsRef.current.length !== M) bandsRef.current = Array(M).fill(0);

  // 화면 폭 기준으로 재배치 임계치(카드 폭 + 여유)
  const leftBound = -viewport.width * 0.65;
  const rightBound = viewport.width * 0.65;
  const margin = CARD_W * 1.2;

  // 렌더 노드: 각 이미지 1장만 생성 (키는 원본 인덱스)
  const baseCards = useMemo(
    () => images.map((src, k) => ({ k, src, z: k * depthStep, rotY: tilt })),
    [images, depthStep, tilt]
  );

  // 부드러운 이동 + 오프스크린 리사이클
  useFrame((_state, dt) => {
    if (!group.current) return;

    // 1) 그룹 이동(절대 pos, 래핑 없음)
    const targetX = -posRef.current;
    group.current.position.x = THREE.MathUtils.damp(group.current.position.x, targetX, 6, dt);

    // 2) 각 카드의 화면상 x 계산 후, 화면 밖이면 ±period로 점프(오프스크린에서만)
    const worldPosX = group.current.position.x; // = -pos (damped)
    for (let k = 0; k < M; k++) {
      const logicalX = (k + bandsRef.current[k] * M) * gap; // 현재 밴드의 x
      const screenX = logicalX + worldPosX - (-1.5); // 그룹의 base offset([-1.5,0,0]) 보정
      if (screenX < leftBound - margin) {
        bandsRef.current[k] += 1; // 오른쪽으로 한 주기 이동
      } else if (screenX > rightBound + margin) {
        bandsRef.current[k] -= 1; // 왼쪽으로 한 주기 이동
      }
    }
  });

  // 실제 렌더: x는 밴드 적용 값으로 계산해 넘김
  return (
    <group ref={group} position={[-1.5, 0, 0]}>
      {baseCards.map(({ k, src, z, rotY }) => {
        const x = (k + bandsRef.current[k] * M) * gap;
        return (
          <GlassCard
            key={k}
            index={k + bandsRef.current[k] * M} // center와의 거리 계산에 사용(연속성 유지)
            total={M}
            center={center}
            src={src}
            x={x}
            z={z}
            rotY={rotY}
            sharedGeom={useMemo(() => new THREE.PlaneGeometry(CARD_W, CARD_H), [])}
            onSelect={onSelect}
          />
        );
      })}
    </group>
  );
}
// src/modules/Gallery3D/StackedPlanes.tsx
// 스크롤/배치 관리 + GlassCard 여러 개 배치

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";
import GlassCard from "./GlassCard";
import { CARD_W, CARD_H } from "./options";

type Props = {
  images: string[];
  gap: number;
  tilt: number;
  depthStep: number;
  onSelect: (src: string) => void;
};

export default function StackedPlanes({ images, gap, tilt, depthStep, onSelect }: Props) {
  const group = useRef<THREE.Group>(null);
  const scroll = useScroll();

  const sharedPlaneGeom = useMemo(() => new THREE.PlaneGeometry(CARD_W, CARD_H), []);
  const planes = useMemo(
    () => images.map((src, i) => ({ i, src, x: i * gap, z: i * depthStep, rotY: tilt })),
    [images, gap, depthStep, tilt]
  );

  useFrame((_state, delta) => {
    if (!group.current) return;
    const totalWidth = (images.length - 1) * gap;
    const targetX = -scroll.offset * totalWidth;
    group.current.position.x = THREE.MathUtils.damp(group.current.position.x, targetX, 6, delta);
  });

  return (
    <group ref={group} position={[-1.5, 0, 0]}>
      {planes.map((p) => (
        <GlassCard
          key={p.i}
          index={p.i}
          total={images.length}
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

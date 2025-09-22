import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three/src/Three.js";
import { useFrame } from "@react-three/fiber";

function Astronaut({ planetRef }: { planetRef: React.RefObject<THREE.Group | null> }) {
  const { scene } = useGLTF("/spaceman.glb");
  const astronautRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!astronautRef.current || !planetRef.current) return;
    const t = state.clock.elapsedTime;

    // 행성 중심을 기준으로 공전
    const planetPos = new THREE.Vector3();
    planetRef.current.getWorldPosition(planetPos);
    astronautRef.current.position.x = planetPos.x + Math.cos(t * 0.5) * 3.5;
    astronautRef.current.position.y = planetPos.y + Math.sin(t * 0.5) * 3.5;
    astronautRef.current.position.z = planetPos.z;
  });

  return <primitive ref={astronautRef} object={scene} scale={1} />;
}

export default Astronaut;

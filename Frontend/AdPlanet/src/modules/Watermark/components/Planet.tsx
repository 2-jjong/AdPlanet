// src/components/UI/Loading/LogoLoading.tsx
import React, { useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three/src/Three.js";
import Stars from "../../Home/components/Stars";
import ShootingStar from "../../../components/UI/Loading/ShootingStar";

const WalkModel: React.FC = () => {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF("/hello.glb");
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    if (actions) {
      // 첫 번째 애니메이션 실행
      const first = Object.values(actions)[0];
      first?.reset().play();
    }
  }, [actions]);

  return (
    <primitive
      ref={group}
      object={scene}
      scale={1}
      position={[0, -0.8, 0]}
      // rotation={[0, Math.PI / 4, 0]}
    />
  );
};

const PlanetModel: React.FC = () => {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF("/planet.glb"); // ✅ public 폴더라 /walk.glb 가능
  useFrame(() => {
    if (group.current) {
      group.current.rotation.y -= 0.003; // Y축 기준으로 제자리 회전
    }
  });
  return (
    <primitive
      ref={group}
      object={scene}
      scale={0.6}
      position={[0, -7, 0]}
      rotation={[0, Math.PI / 4, 0]}
    />
  );
};

const Planet: React.FC = () => {
  return (
    <div className='relative w-full h-full'>
      <Canvas camera={{ position: [2, 0, 5], fov: 50 }}>
        <Stars size={2} />
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 7, 5]} intensity={3} castShadow />
        {/* <WalkModel /> */}
        <PlanetModel />
        <ShootingStar startX={10} startY={6} startZ={-5} />
        <ShootingStar startX={12} startY={8} startZ={-3} />
        <ShootingStar startX={15} startY={10} startZ={-7} />
      </Canvas>
    </div>
  );
};

export default Planet;

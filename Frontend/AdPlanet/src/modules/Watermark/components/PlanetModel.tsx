import React, { useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import ShootingStar from "../../../components/UI/Loading/ShootingStar";
import * as THREE from "three/src/Three.js";

const Planet: React.FC = () => {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/puple_planet.glb");

  useFrame(() => {
    if (group.current) {
      group.current.rotation.y -= 0.003;
    }
  });

  return (
    <primitive
      ref={group}
      object={scene}
      scale={3}
      position={[0, 0, 0]}
      rotation={[0, Math.PI / 4, 0]}
    />
  );
};

const PlanetModel: React.FC = () => {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 7, 5]} intensity={3} castShadow />
      <Planet />
      <ShootingStar startX={10} startY={6} startZ={-5} />
      <ShootingStar startX={12} startY={8} startZ={-3} />
      <ShootingStar startX={15} startY={10} startZ={-7} />
    </>
  );
};

export default PlanetModel;

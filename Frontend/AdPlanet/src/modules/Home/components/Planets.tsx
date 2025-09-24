import React, { type RefObject } from "react";
import * as THREE from "three/src/Three.js";
import gsap from "gsap";

// 행성 정보 타입
export interface PlanetInfo {
  key: string;
  name: string;
  des: string;
  route: string;
  ref: RefObject<THREE.Group | null>;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
}

// props 타입
interface PlanetProps {
  info: PlanetInfo;
  nodes: Record<string, THREE.Mesh>;
  materials: Record<string, THREE.Material>;
  activePlanet: string | null;
  setActivePlanet: (p: string) => void;
  setPlanetDes: (d: string) => void;
  setRoute: (r: string) => void;
  camera: THREE.Camera;
}

const Planets: React.FC<PlanetProps> = ({
  info,
  nodes,
  materials,
  activePlanet,
  setActivePlanet,
  setPlanetDes,
  setRoute,
  camera,
}) => {
  return (
    <group
      ref={info.ref}
      position={info.position}
      rotation={info.rotation}
      scale={info.scale}
      onClick={() => {
        if (!activePlanet) {
          const worldPos = new THREE.Vector3();
          info.ref.current!.getWorldPosition(worldPos);

          gsap.to(camera.position, {
            x: worldPos.x,
            y: worldPos.y,
            z: worldPos.z + 100,
            duration: 2,
            onUpdate: () => camera.lookAt(worldPos),
          });
          gsap.to(info.ref.current!.scale, {
            x: info.scale * 15,
            y: info.scale * 15,
            z: info.scale * 15,
            duration: 2,
            ease: "power2.inOut",
          });

          setActivePlanet(info.name);
          setPlanetDes(info.des);
          setRoute(info.route);
        }
      }}
    >
      {/* 🟡 여기서 행성별 mesh를 분기해 넣어야 함 */}
      {/* 예시 */}
      <mesh geometry={nodes.Planet02_Ice_0.geometry} material={materials.material} />
    </group>
  );
};

export default Planets;

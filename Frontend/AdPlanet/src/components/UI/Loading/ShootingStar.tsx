import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three/src/Three.js";

interface ShootingStarProps {
  startX?: number;
  startY?: number;
  startZ?: number;
}

const ShootingStar: React.FC<ShootingStarProps> = ({ startX = 10, startY = 5, startZ = -5 }) => {
  const starRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (starRef.current) {
      // 별똥별 이동 (오른쪽 위 → 왼쪽 아래)
      starRef.current.position.x -= delta * 10; // X축 왼쪽으로
      starRef.current.position.y -= delta * 5; // Y축 아래로
      starRef.current.position.z += delta * 2; // 살짝 Z 깊이도 이동

      // 화면 벗어나면 위치 초기화
      if (starRef.current.position.x < -15 || starRef.current.position.y < -10) {
        starRef.current.position.set(startX, startY, startZ);
      }
    }
  });

  return (
    <mesh ref={starRef} position={[startX, startY, startZ]}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshBasicMaterial color='white' />
    </mesh>
  );
};

export default ShootingStar;

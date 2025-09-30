import { useMemo } from "react";
import * as THREE from "three/src/Three.js"
import { useFrame } from "@react-three/fiber";

interface StarsProps {
  size?: number; // 기본값을 줄 수 있도록 optional
}

const Stars: React.FC<StarsProps> = ({ size }) => {
  const starGeo = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    for (let i = 0; i < 2000; i++) {
      const x = THREE.MathUtils.randFloatSpread(2000);
      const y = THREE.MathUtils.randFloatSpread(2000);
      const z = THREE.MathUtils.randFloatSpread(2000);
      vertices.push(x, y, z);
    }
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    return geometry;
  }, []);

  const starMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: size,
    transparent: true,
  });

  const stars = new THREE.Points(starGeo, starMat);

  useFrame(() => {
    stars.rotation.y += 0.0005;
  });

  return <primitive object={stars} />;
};

export default Stars;

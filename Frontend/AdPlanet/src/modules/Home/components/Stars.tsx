import { useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

function Stars() {
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
    size: 100,
    transparent: true,
  });

  const stars = new THREE.Points(starGeo, starMat);

  useFrame(() => {
    stars.rotation.y += 0.0005; // 천천히 회전하는 효과
  });

  return <primitive object={stars} />;
}

export default Stars;

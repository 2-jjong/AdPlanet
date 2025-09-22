
import * as THREE from "three/src/Three.js";

export const moveCameraTo = (
  camera: THREE.Camera,
  target: THREE.Vector3,
  distance = 100,
  duration = 2
) => {
  const targetCamPos = new THREE.Vector3(target.x, target.y, target.z + distance);

  gsap.to(camera.position, {
    x: targetCamPos.x,
    y: targetCamPos.y,
    z: targetCamPos.z,
    duration,
    onUpdate: () => camera.lookAt(target),
    ease: "power2.inOut",
  });
};

export const scaleObject = (
  object: THREE.Object3D,
  targetScale: number,
  duration = 2
) => {
  gsap.to(object.scale, {
    x: targetScale,
    y: targetScale,
    z: targetScale,
    duration,
    ease: "power2.inOut",
  });
};

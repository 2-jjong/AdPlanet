// src/components/PlanetWorld.tsx
import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as TWEEN from "@tweenjs/tween.js";

interface PlanetData {
  name: string;
  path: string;
  position: [number, number, number];
  description: string;
  scale: number;
}

const planets: PlanetData[] = [
  {
    name: "logo",
    path: "/model/red_planet.glb",
    position: [-30, 15, 0],
    description: "로고 생성 설명",
    scale: 9,
  },
  {
    name: "poster",
    path: "/model/red_planet.glb",
    position: [33, 30, 0],
    description: "포스터 생성 설명",
    scale: 10,
  },
  {
    name: "watermark",
    path: "/model/red_planet.glb",
    position: [-50, -20, 0],
    description: "워터마크 설명",
    scale: 20,
  },
  {
    name: "library",
    path: "/model/red_planet.glb",
    position: [45, -15, 0],
    description: "라이브러리 설명",
    scale: 4,
  },
];

const PlanetWorld: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activePlanet, setActivePlanet] = useState<PlanetData | null>(null);

  useEffect(() => {
    const mount = mountRef.current!;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 70);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    // const controls = new OrbitControls(camera, renderer.domElement);
    // controls.enableZoom = false;

    scene.add(new THREE.AmbientLight(0xffffff, 1));

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const clickable: THREE.Object3D[] = [];

    const loader = new GLTFLoader();
    planets.forEach((p) => {
      loader.load(p.path, (gltf) => {
        const planet = gltf.scene;
        planet.position.set(...p.position);
        planet.scale.set(p.scale, p.scale, p.scale);
        planet.name = p.name;
        scene.add(planet);
        clickable.push(planet);
      });
    });

    const onClick = (event: MouseEvent) => {
      mouse.x = (event.clientX / mount.clientWidth) * 2 - 1;
      mouse.y = -(event.clientY / mount.clientHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(clickable, true);
      if (intersects.length > 0) {
        const obj = intersects[0].object;
        const root = findRoot(obj, clickable);
        const planet = planets.find((p) => p.name === root.name);
        if (planet) {
          zoomToPlanet(camera, planet.position, () => setActivePlanet(planet));
        }
      }
    };
    mount.addEventListener("click", onClick);

    const animate = (time?: number) => {
      requestAnimationFrame(animate);
      TWEEN.update(time);
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      mount.removeEventListener("click", onClick);
      renderer.dispose();
    };
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />
      {activePlanet && (
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "10%",
            color: "#fff",
            zIndex: 10,
          }}
        >
          <h1>{activePlanet.name}</h1>
          <p>{activePlanet.description}</p>
          <button onClick={() => alert(`${activePlanet.name} 이동!`)}>
            시작하기
          </button>
        </div>
      )}
    </div>
  );
};

function zoomToPlanet(
  camera: THREE.PerspectiveCamera,
  target: [number, number, number],
  onComplete: () => void
) {
  const start = {
    x: camera.position.x,
    y: camera.position.y,
    z: camera.position.z,
  };
  const end = { x: target[0], y: target[1] + 2, z: target[2] + 20 }; // 확대시 카메라 이동 목표

  new TWEEN.Tween(start)
    .to(end, 2000)
    .easing(TWEEN.Easing.Cubic.InOut)
    .onUpdate(() => {
      camera.position.set(start.x, start.y, start.z);
      camera.lookAt(new THREE.Vector3(...target));
    })
    .onComplete(onComplete)
    .start();
}

function findRoot(obj: THREE.Object3D, roots: THREE.Object3D[]) {
  while (obj.parent && !roots.includes(obj)) obj = obj.parent;
  return obj;
}

export default PlanetWorld;

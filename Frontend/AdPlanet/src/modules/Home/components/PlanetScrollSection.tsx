// src/components/PlanetScrollSection.tsx

import React, { useRef, useEffect } from "react";
import * as THREE from "three";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface PlanetScrollSectionProps {
  modelPath: string;
  sectionId: string;
}

const PlanetScrollSection: React.FC<PlanetScrollSectionProps> = ({
  modelPath,
  sectionId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const planetRef = useRef<THREE.Object3D | null>(null);

  useEffect(() => {
    const container = containerRef.current!;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 10);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      canvas: canvasRef.current!,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;

    const loader = new GLTFLoader();
    loader.load(modelPath, (gltf: any) => {
      const planet = gltf.scene;
      planetRef.current = planet;
      scene.add(planet);
    });

    const ambient = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambient);

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // ScrollTrigger 설정
    ScrollTrigger.create({
      trigger: `#${sectionId}`,
      start: "top top",
      end: "bottom top",
      scrub: true,
      onUpdate: (self: { progress: any }) => {
        const progress = self.progress;
        // 예: 카메라 위치 변화
        camera.position.z = 10 - 5 * progress;
        if (planetRef.current) {
          planetRef.current.rotation.y = progress * Math.PI * 2;
        }
      },
    });

    const onResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      // ScrollTrigger 제거
      ScrollTrigger.kill();
      renderer.dispose();
    };
  }, [modelPath, sectionId]);

  return (
    <div
      id={sectionId}
      ref={containerRef}
      style={{ position: "relative", width: "100%", height: "100vh" }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%" }}
      />
    </div>
  );
};

export default PlanetScrollSection;

import React from "react";
import * as THREE from "three";

interface InteractiveCanvasProps {
  className?: string;
  particleCount?: number;
}

const InteractiveCanvas: React.FC<InteractiveCanvasProps> = ({ className = "", particleCount = 2000 }) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const rafRef = React.useRef<number | null>(null);
  const rendererRef = React.useRef<THREE.WebGLRenderer | null>(null);
  const pointsRef = React.useRef<THREE.Points | null>(null);
  const cameraRef = React.useRef<THREE.PerspectiveCamera | null>(null);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const width = container.clientWidth;
    const height = container.clientHeight;
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 4.5;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const radius = 1.2 + Math.random() * 2.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0x22d3ee,
      size: 0.02,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const points = new THREE.Points(geometry, material);
    pointsRef.current = points;
    scene.add(points);

    let targetRotX = 0;
    let targetRotY = 0;

    const onMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const mouseX = x * 2 - 1;
      const mouseY = -(y * 2 - 1);
      targetRotY = mouseX * 0.25;
      targetRotX = mouseY * 0.25;
    };
    container.addEventListener("mousemove", onMouseMove);

    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    const tick = () => {
      if (pointsRef.current) {
        pointsRef.current.rotation.x += (targetRotX - pointsRef.current.rotation.x) * 0.03;
        pointsRef.current.rotation.y += (targetRotY - pointsRef.current.rotation.y) * 0.03;
        pointsRef.current.rotation.z += 0.0015;
      }
      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
      container.removeEventListener("mousemove", onMouseMove);
      if (rendererRef.current) {
        container.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
      geometry.dispose();
      material.dispose();
    };
  }, [particleCount]);

  return <div ref={containerRef} className={className} />;
};

export default InteractiveCanvas;



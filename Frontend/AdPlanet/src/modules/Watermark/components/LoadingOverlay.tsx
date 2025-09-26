import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import planetImg from "../../../assets/images/puple_planet.png";

interface WatermarkLoadingOverlayProps {
  visible: boolean;
}

const WatermarkLoadingOverlay: React.FC<WatermarkLoadingOverlayProps> = ({ visible }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!visible) return; // 안 보일 때는 렌더링 안 함
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const keyLight = new THREE.PointLight(0x87deda, 2, 100);
    keyLight.position.set(5, 5, 6);
    scene.add(keyLight);

    const pivot1 = new THREE.Object3D();
    const pivot2 = new THREE.Object3D();
    const pivot3 = new THREE.Object3D();
    scene.add(pivot1, pivot2, pivot3);

    const moon1 = new THREE.Mesh(
      new THREE.SphereGeometry(0.45, 24, 24),
      new THREE.MeshStandardMaterial({
        color: 0x87deda,
        emissive: 0x87deda,
        emissiveIntensity: 0.6,
      })
    );
    moon1.position.x = 3.8;
    pivot1.add(moon1);

    const moon2 = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 24, 24),
      new THREE.MeshStandardMaterial({
        color: 0xb388ff,
        emissive: 0xb388ff,
        emissiveIntensity: 0.5,
      })
    );
    moon2.position.x = -5.2;
    pivot2.rotation.x = Math.PI / 6;
    pivot2.add(moon2);

    const moon3 = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 24, 24),
      new THREE.MeshStandardMaterial({
        color: 0xffd166,
        emissive: 0xffd166,
        emissiveIntensity: 0.4,
      })
    );
    moon3.position.x = 6.4;
    pivot3.rotation.x = -Math.PI / 8;
    pivot3.add(moon3);

    camera.position.z = 8;

    let rafId = 0;
    const tick = () => {
      rafId = requestAnimationFrame(tick);
      pivot1.rotation.y += 0.04;
      pivot2.rotation.y += 0.03;
      pivot3.rotation.y += 0.05;
      renderer.render(scene, camera);
    };
    tick();

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
    };
  }, [visible]);

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Three.js 배경 */}
      <canvas ref={canvasRef} className='fixed inset-0 z-0 pointer-events-none' />

      {/* 행성 이미지 */}
      <img
        src={planetImg}
        alt='planet'
        className='fixed left-1/2 bottom-1/2 -translate-x-1/2 translate-y-1/2 w-[420px] z-30 opacity-100 animate-planet-breath'
      />

      {/* 텍스트 */}
      <div className='fixed inset-0 z-50 flex flex-col items-center justify-center text-center'>
        <h3 className='text-3xl sm:text-4xl font-bold text-white mb-3 animate-breath'>
          콘텐츠를 분석하고 있습니다...
        </h3>
        <p
          className='text-lg sm:text-xl text-gray-200 animate-breath'
          style={{ animationDelay: "0.2s" }}
        >
          잠시만 기다려주세요. 행성의 기운을 모아 소유권을 확인 중입니다.
        </p>
      </div>
    </div>
  );
};

export default WatermarkLoadingOverlay;

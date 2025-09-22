import React, { useEffect } from "react";
import Navigation from "../../../components/Layout/Navigation";
import Gallery3D from "../components/Gallery3D";

import { Model } from "../components/Model";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
const HomePage: React.FC = () => {
  useEffect(() => {
    const handleBack = (event: PopStateEvent) => {
      event.preventDefault();
      window.history.pushState(null, "", window.location.href);
    };

    // 현재 상태를 push
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handleBack);

    return () => {
      window.removeEventListener("popstate", handleBack);
    };
  }, []);

  return (
    <div className='w-full h-screen overflow-hidden'>
      <Navigation />
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} />
        <Stars />
        <Model />
        <OrbitControls />
      </Canvas>
    </div>
  );
};

export default HomePage;

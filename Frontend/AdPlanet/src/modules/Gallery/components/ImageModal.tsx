// src/modules/Gallery3D/ImageModal.tsx
// 클릭 시 사진 크게 보기 모달

import { useState, useEffect } from "react";

export default function ImageModal({ src, onClose }: { src: string; onClose: () => void }) {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // 컴포넌트 마운트 시 애니메이션 시작
    const timer = setTimeout(() => setIsAnimating(false), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsAnimating(true);
    setTimeout(onClose, 300); // 애니메이션 시간과 맞춤
  };

  return (
    <div
      onClick={handleClose}
      style={{
        position: "fixed",
        inset: 0,
        background: isAnimating ? "rgba(0,0,0,0)" : "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        transition: "background 0.3s ease-out",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          transform: isAnimating ? "scale(0.3) translateZ(0)" : "scale(1) translateZ(0)",
          opacity: isAnimating ? 0 : 1,
          transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <img
          src={src}
          alt="preview"
          style={{
            maxWidth: "80vw",
            maxHeight: "80vh",
            display: "block",
            borderRadius: 8,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          }}
        />
      </div>
    </div>
  );
}

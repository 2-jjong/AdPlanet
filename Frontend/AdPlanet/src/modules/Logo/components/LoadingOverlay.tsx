import React from "react";

interface LoadingOverlayProps {
  show: boolean;
  tip?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ show, tip = "생성 중..." }) => {
  if (!show) return null;
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl backdrop-blur-sm z-10">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-cyan-400/30"></div>
          <div className="absolute inset-0 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-fuchsia-400/50 border-b-transparent animate-spin [animation-duration:2.2s]"></div>
        </div>
        <p className="text-cyan-200 font-semibold animate-pulse">{tip}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;



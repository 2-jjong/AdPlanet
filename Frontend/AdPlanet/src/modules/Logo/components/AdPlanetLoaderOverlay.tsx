import React from "react";

interface AdPlanetLoaderOverlayProps {
  show: boolean;
  tip?: string;
}

const AdPlanetLoaderOverlay: React.FC<AdPlanetLoaderOverlayProps> = ({ show, tip = "로고를 멋지게 만드는 중..." }) => {
  if (!show) return null;
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-black/65 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.08)_0%,_transparent_60%)]" />
      <div className="relative w-72 h-60">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-fuchsia-500 shadow-[0_0_40px_rgba(56,189,248,0.35)] animate-[floatY_2.6s_ease-in-out_infinite]" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-40 h-40">
            <span className="absolute inset-0 rounded-full border-2 border-cyan-400/40 animate-[spin_2.8s_linear_infinite]" />
            <span className="absolute inset-2 rounded-full border border-fuchsia-400/50 animate-[spin_3.6s_linear_infinite_reverse]" />
            <span className="absolute inset-4 rounded-full border border-indigo-400/40 animate-[spin_4.6s_linear_infinite]" />
            <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(56,189,248,0.8)]" />
            <span className="absolute top-1/2 -right-1 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-fuchsia-300 shadow-[0_0_10px_rgba(217,70,239,0.8)]" />
            <span className="absolute -bottom-1 left-1/3 w-1.5 h-1.5 rounded-full bg-indigo-300 shadow-[0_0_10px_rgba(129,140,248,0.8)]" />
          </div>
        </div>
        {/* progress bar */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-56">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-indigo-400 animate-[progress_1.4s_ease-in-out_infinite]" />
          </div>
          <div className="mt-2 text-center text-cyan-200 text-sm font-semibold whitespace-nowrap">{tip}</div>
        </div>
        <style>{`
          @keyframes floatY { 0% { transform: translateY(0) } 50% { transform: translateY(-6px) } 100% { transform: translateY(0) } }
          @keyframes progress { 0% { transform: translateX(-120%) } 100% { transform: translateX(300%) } }
        `}</style>
      </div>
    </div>
  );
};

export default AdPlanetLoaderOverlay;



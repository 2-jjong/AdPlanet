import React from "react";

interface StylePreviewOverlayProps {
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  imageSrc: string;
  title: string;
  description: string;
  tips?: string[];
  origin?: { left: number; top: number; width: number; height: number } | null;
}

const StylePreviewOverlay: React.FC<StylePreviewOverlayProps> = ({ open, onClose, onConfirm, imageSrc, title, description, tips = [], origin }) => {
  const [boxStyle, setBoxStyle] = React.useState<React.CSSProperties>({ visibility: 'hidden' });
  const [contentReady, setContentReady] = React.useState(false);

  React.useLayoutEffect(() => {
    if (!open) return;
    const viewportW = typeof window !== 'undefined' ? window.innerWidth : 0;
    const viewportH = typeof window !== 'undefined' ? window.innerHeight : 0;
    const targetW = Math.min(420, Math.floor(viewportW * 0.45));
    const targetH = targetW;
    const targetLeft = (viewportW - targetW) / 2;
    const targetTop = (viewportH - targetH) / 2 - 130;

    // FLIP: 최종 위치/크기에 고정 + 변환으로 원점에서 시작
    if (origin) {
      const originCx = origin.left + origin.width / 2;
      const originCy = origin.top + origin.height / 2;
      const targetCx = targetLeft + targetW / 2;
      const targetCy = targetTop + targetH / 2;
      const dx = originCx - targetCx;
      const dy = originCy - targetCy;
      const sx = origin.width / targetW;
      const sy = origin.height / targetH;
      const spin = (dx >= 0 ? 1 : -1) * 18; // 좀 더 강한 회전으로 휘리릭 느낌 강화

      // 초기 상태: 원점에서 시작 (휘리릭 느낌을 위해 약간의 블러/투명도)
      setBoxStyle({
        position: 'fixed',
        left: targetLeft,
        top: targetTop,
        width: targetW,
        height: targetH,
        transformOrigin: 'center center',
        transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy}) rotate(${spin}deg)`,
        filter: 'blur(10px)',
        opacity: 0.92,
        willChange: 'transform, filter, opacity',
        visibility: 'visible',
      });

      const id = requestAnimationFrame(() => {
        setBoxStyle((prev) => ({
          ...prev,
          transform: 'translate(0, 0) scale(1, 1) rotate(0deg)',
          filter: 'blur(0px)',
          opacity: 1,
          transition: 'transform .28s cubic-bezier(.2,.9,.2,1), filter .28s ease, opacity .18s ease',
        }));
        setTimeout(() => setContentReady(true), 100);
      });
      return () => cancelAnimationFrame(id);
    } else {
      // 원점 정보가 없을 때는 중앙에서 페이드/살짝 확대
      setBoxStyle({
        position: 'fixed',
        left: targetLeft,
        top: targetTop,
        width: targetW,
        height: targetH,
        transformOrigin: 'center center',
        transform: 'scale(.96)',
        opacity: 0,
        visibility: 'visible',
      });
      const id = requestAnimationFrame(() => {
        setBoxStyle((prev) => ({
          ...prev,
          transform: 'scale(1)',
          opacity: 1,
          transition: 'transform .26s ease, opacity .18s ease',
        }));
        setTimeout(() => setContentReady(true), 100);
      });
      return () => cancelAnimationFrame(id);
    }
  }, [open, origin]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div style={boxStyle} className="shadow-2xl">
        <img src={imageSrc} alt={title} className="w-full h-full object-contain" />
      </div>

      <div className={"fixed left-1/2 top-[60%] -translate-x-1/2 w-[92vw] max-w-[720px] px-6 " + (contentReady ? "opacity-100 translate-y-0 transition-all duration-500" : "opacity-0 translate-y-2")}
      >
        <div className="rounded-2xl border border-white/10 bg-[#0f1121]/95 p-6 md:p-7 shadow-xl">
          <div className="flex items-start justify-between">
            <h3 className="text-xl md:text-2xl font-bold text-white">{title}</h3>
            <button className="text-white/70 hover:text-white" onClick={onClose}>✕</button>
          </div>
          <p className="mt-3 text-white/80 leading-relaxed">{description}</p>
          {tips.length > 0 && (
            <ul className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
              {tips.map((t, i) => (
                <li key={i} className="text-sm text-white/70">• {t}</li>
              ))}
            </ul>
          )}
          <div className="mt-6 flex justify-end gap-2">
            <button
              className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/15"
              onClick={onClose}
            >
              닫기
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white font-semibold hover:opacity-95"
              onClick={onConfirm ?? onClose}
            >
              선택하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StylePreviewOverlay;



// src/modules/Gallery3D/useInfiniteScroller.ts
import { useEffect, useRef } from "react";

type Opts = {
  onChange: (pos: number) => void; // 절대 스크롤(누적), 단위=월드 x
  friction?: number;
  wheelSpeed?: number;
  dragSpeed?: number;
};

export function useInfiniteScroller(target: HTMLElement | null, opts: Opts) {
  const { onChange, friction = 0.92, wheelSpeed = 1.0, dragSpeed = 1.0 } = opts;
  const pos = useRef(0);
  const vel = useRef(0);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const raf = useRef(0);

  const loop = () => {
    vel.current *= friction;
    if (Math.abs(vel.current) < 0.00001) vel.current = 0;
    if (vel.current !== 0) {
      pos.current += vel.current;   // ← 래핑 없음
      onChange(pos.current);
    }
    raf.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    if (!target) return;

    const getX = (e: any) => e.clientX ?? e.touches?.[0]?.clientX ?? 0;

    const onWheel = (e: WheelEvent) => {
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      vel.current += delta * wheelSpeed * 0.002;
      e.preventDefault();
    };
    const onDown = (e: PointerEvent | TouchEvent) => { dragging.current = true; lastX.current = getX(e); };
    const onMove = (e: PointerEvent | TouchEvent) => {
      if (!dragging.current) return;
      const dx = getX(e) - lastX.current;
      lastX.current = getX(e);
      pos.current -= dx * dragSpeed * 0.01;
      onChange(pos.current);
    };
    const onUp = () => { dragging.current = false; };

    target.addEventListener("wheel", onWheel, { passive: false });
    target.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    target.addEventListener("touchstart", onDown, { passive: false });
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);

    raf.current = requestAnimationFrame(loop);
    return () => {
      target.removeEventListener("wheel", onWheel as any);
      target.removeEventListener("pointerdown", onDown as any);
      window.removeEventListener("pointermove", onMove as any);
      window.removeEventListener("pointerup", onUp as any);
      target.removeEventListener("touchstart", onDown as any);
      window.removeEventListener("touchmove", onMove as any);
      window.removeEventListener("touchend", onUp as any);
      cancelAnimationFrame(raf.current);
    };
  }, [target, wheelSpeed, dragSpeed, friction]);
}

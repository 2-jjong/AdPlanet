// LogoCardList.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel, Scrollbar } from "swiper/modules";
import { LogoCard } from "./LogoCard";
import { getLogoList } from "../../../services/logoService";
import type { LogoListItem as LogoCardType, LogoListQuery } from "../../../services/dto/logo.dto";

/** 정렬 */
function parseOrder(v: string | null): LogoListQuery["order"] {
  return v === "OLDEST" ? "OLDEST" : "NEWEST"; // 기본값 NEWEST (기존 그대로 유지)
}

/** 태그 ID */
function parseTagId(v: string | null): number {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export default function LogoCardList() {
  console.debug("[LogoCardList] mount");

  const [items, setItems] = useState<LogoCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  const [sp] = useSearchParams();

  const order: LogoListQuery["order"] = parseOrder(sp.get("order"));
  const tagId: number = parseTagId(sp.get("tagId"));

  useEffect(() => {
    console.debug("[LogoCardList] effect run");

    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        console.debug("[LogoCardList] fetch list", { order, tagId });

        const response = await getLogoList({ order, tagId }); // 서비스가 이미 Domain 배열 반환
        if (!alive) return;
        setItems(response.data ?? []);

        console.debug("[LogoCardList] fetched items:", response.data?.length ?? 0);
      } catch (e: any) {
        if (!alive) return;
        console.error("[LogoCardList] fetch error:", e?.message ?? e);
        setError(e instanceof Error ? e.message : "Failed to load logos");
        setItems([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [order, tagId]);

  // 스택/전환 상태
  const [active, setActive] = useState(0);
  const [ghost, setGhost] = useState<LogoCardType | null>(null);
  const [ghostLeaving, setGhostLeaving] = useState(false);

  useEffect(() => {
    if (active >= items.length) setActive(0);
  }, [items.length, active]);

  const WRAP_W = 480, WRAP_H = 480, STACK_W = 400;
  const OFFSET = 28, SCALE_STEP = 0.055, OP_STEP = 0.2, LAYERS = 4;

  const stack = useMemo(() => {
    const out: { item: LogoCardType; layer: number }[] = [];
    for (let layer = 0; layer < LAYERS; layer++) {
      const idx = active + layer;
      if (idx >= items.length) break;
      out.push({ item: items[idx], layer });
    }
    return out;
  }, [active, items]);

  const handleSlideChangeStart = (newIndex: number) => {
    const leaving = items[active];
    if (leaving) {
      setGhost(leaving);
      setGhostLeaving(false);
      requestAnimationFrame(() => setGhostLeaving(true));
    }
    setActive(newIndex);
  };

  const onGhostEnd = () => {
    if (ghostLeaving) {
      setGhost(null);
      setGhostLeaving(false);
    }
  };

  const ghostStyle: React.CSSProperties = {
    position: "absolute",
    left: "50%",
    transform: `translateX(-50%) translateY(${ghostLeaving ? "-64px" : "0px"}) scale(${ghostLeaving ? 0.96 : 1})`,
    bottom: 0,
    width: STACK_W,
    zIndex: 200,
    opacity: ghostLeaving ? 0 : 1,
    transition: "transform 320ms ease, opacity 320ms ease",
    pointerEvents: "none",
  };

  const layerStyle = (layer: number): React.CSSProperties => ({
    position: "absolute",
    left: "50%",
    transform: `translateX(-50%) scale(${1 - layer * SCALE_STEP})`,
    bottom: layer * OFFSET,
    width: STACK_W,
    zIndex: 150 - layer,
    opacity: Math.max(1 - layer * OP_STEP, 0.25),
    transition: "transform 280ms ease, opacity 280ms ease",
    pointerEvents: "none",
  });

  const Overlay = () => {
    if (loading) return (
      <div className="absolute inset-0 z-30 flex items-center justify-center">
        <div className="animate-pulse text-slate-300">로딩 중…</div>
      </div>
    );
    if (error) return (
      <div className="absolute inset-0 z-30 flex	items-center justify-center">
        <div className="text-red-300 text-sm bg-red-900/30 px-3 py-2 rounded-lg border border-red-800">{error}</div>
      </div>
    );
    if (!items.length) return (
      <div className="absolute inset-0 z-30 flex items-center justify-center text-slate-400">
        표시할 로고가 없습니다.
      </div>
    );
    return null;
  };

  const navigate = useNavigate();
  const goDetail = () => {
    const it = items[active];
    if (!it) return;
    navigate(`/archive/logo/${it.logoId}`);
  };

  // 휠 이벤트를 직접 받아서 Swiper 제어
  const swiperRef = useRef<any>(null);
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const sw = swiperRef.current;
    if (!sw) return;

    // 세로 스크롤만 처리
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;

    e.preventDefault();
    e.stopPropagation();

    if (e.deltaY > 0) sw.slideNext();
    else sw.slidePrev();
  };

  return (
    <div className="space-y-4">
      <div
        className="relative overflow-visible"
        style={{ width: WRAP_W, height: WRAP_H }}
        onWheel={handleWheel}         // 휠 이벤트 포워딩
      >
        <Overlay />

        <div className="absolute inset-0 z-20 pointer-events-none">
          {ghost && (
            <div style={ghostStyle} onTransitionEnd={onGhostEnd}>
              <LogoCard title={ghost.name} imgUrl={ghost.imgUrl} />
            </div>
          )}
          {stack.map(({ item, layer }) => (
            <div key={`${item.logoId}-${layer}`} style={layerStyle(layer)}>
              <LogoCard
                title={item.name}
                imgUrl={item.imgUrl}
                isActive={layer === 0}
              />
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <button
            onClick={goDetail}
            className="absolute z-30"
            style={{
              left: "50%",
              transform: "translateX(-50%)",
              bottom: 0,
              width: STACK_W,
              height: 400,
              borderRadius: 16,
              background: "transparent",
            }}
            aria-label="상세 보기"
            title="상세 보기"
          />
        )}

        <Swiper
          direction="vertical"
          modules={[Mousewheel, Scrollbar]}
          mousewheel={{ forceToAxis: true, releaseOnEdges: true }}
          scrollbar={{ draggable: true }}
          slidesPerView={1}
          speed={380}
          onSlideChangeTransitionStart={(sw) => handleSlideChangeStart(sw.activeIndex)}
          onSwiper={(sw) => (swiperRef.current = sw)}   // Swiper 인스턴스 보관
          className="absolute top-0 left-0 h-full w-full z-10"
          style={
            {
              "--swiper-scrollbar-size": "10px",
              "--swiper-scrollbar-right": "0.75rem",
              "--swiper-scrollbar-bg-color": "rgba(255,255,255,0.10)",
              "--swiper-scrollbar-drag-bg-color": "primary",
              "--swiper-scrollbar-sides-offset": "0.5rem",
            } as React.CSSProperties
          }
        >
          {Array.from({ length: Math.max(items.length, 1) }).map((_, i) => (
            <SwiperSlide key={i} className="!h-full">
              <div className="h-full opacity-0 pointer-events-none" />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}

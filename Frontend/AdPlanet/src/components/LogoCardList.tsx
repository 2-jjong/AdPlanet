import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel, Scrollbar } from "swiper/modules";
import { LogoCard } from "./LogoCard";
import { getLogoList } from "../services/logoService";
import type { LogoCard as LogoCardType, LogoListOrder } from "../types/logo";

function parseOrder(v: string | null): LogoListOrder {
  return v === "OLDEST" ? "OLDEST" : "LATEST"; // 기본값 LATEST
}
function parseTagId(v: string | null): number {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export default function LogoCardList() {
  // debug : 컴포넌트 렌더 확인
  console.debug("[LogoCardList] mount"); 


  const [items, setItems] = useState<LogoCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  const [sp, setSp] = useSearchParams();

  // 쿼리 파싱
  const order: LogoListOrder = parseOrder(sp.get("order"));
  const tagId: number = parseTagId(sp.get("tagId"));

  // 최초 및 필터 변경 시 목록 로드
  useEffect(() => {
    console.debug("[LogoCardList] effect run"); // 이펙트 실행 확인

    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        // debug : 어떤 파라미터로 호출되는지 보기
        console.debug("[LogoCardList] fetch list", { order, tagId });

        const data = await getLogoList({ order, tagId });

        if (!alive) return;
        setItems(data);

        // debug : 결과 개수 확인
        console.debug("[LogoCardList] fetched items:", data.length);
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

  // ----------------------------------------------------------
  // 카드 스택 및 전환
  // ----------------------------------------------------------

  // 스택/전환 상태
  const [active, setActive] = useState(0);
  const [ghost, setGhost] = useState<LogoCardType | null>(null);
  const [ghostLeaving, setGhostLeaving] = useState(false);

  // 데이터 바뀌면 active 보정
  useEffect(() => {
    if (active >= items.length) setActive(0);
  }, [items.length, active]);

  // 스택 파라미터/치수
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

  // 슬라이드 전환 시작 핸들러
  const handleSlideChangeStart = (newIndex: number) => {
    const leaving = items[active];
    if (leaving) {
      setGhost(leaving);
      setGhostLeaving(false);
      requestAnimationFrame(() => setGhostLeaving(true));
    }
    setActive(newIndex);
  };

  // 고스트 애니메이션 종료 핸들러
  const onGhostEnd = () => {
    if (ghostLeaving) {
      setGhost(null);
      setGhostLeaving(false);
    }
  };

  // 애니메이션 스타일 
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

  // 각 레이어 스타일 (0이 최상단)
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
  // ----------------------------------------------------------

  // 상태 오버레이
  const Overlay = () => {
    if (loading) return (
      <div className="absolute inset-0 z-30 flex items-center justify-center">
        <div className="animate-pulse text-slate-300">로딩 중…</div>
      </div>
    );
    if (error) return (
      <div className="absolute inset-0 z-30 flex items-center justify-center">
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

  // 상세로 이동
  const navigate = useNavigate();
  const goDetail = () => {
    const it = items[active];
    if (!it) return;
    navigate(`/archive/logo/${it.id}`);
  };


  // 렌더링 ----------------------------------------
  return (
    <div className="space-y-4">
      <div className="relative overflow-visible" style={{ width: WRAP_W, height: WRAP_H }}>
        <Overlay />

        {/* 스택 */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          {ghost && (
            <div style={ghostStyle} onTransitionEnd={onGhostEnd}>
              <LogoCard title={ghost.name} imgUrl={ghost.imageUrl} />
            </div>
          )}
          {stack.map(({ item, layer }) => (
            <div key={`${item.id}-${layer}`} style={layerStyle(layer)}>
              <LogoCard
                title={item.name}
                imgUrl={item.imageUrl}
                isActive={layer === 0}
              />
            </div>
          ))}
        </div>

        {/* 클릭 타깃(최상단 카드 영역만 클릭 허용) */}
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

        {/* Swiper */}
        <Swiper
          direction="vertical"
          modules={[Mousewheel, Scrollbar]}
          mousewheel={{ forceToAxis: true, releaseOnEdges: true }}
          scrollbar={{ draggable: true }}
          slidesPerView={1}
          speed={380}
          onSlideChangeTransitionStart={(sw) => handleSlideChangeStart(sw.activeIndex)}
          className="absolute top-0 left-0 h-full w-full z-10"
          style={
            {
              "--swiper-scrollbar-size": "10px",
              "--swiper-scrollbar-right": "0.75rem",
              "--swiper-scrollbar-bg-color": "rgba(255,255,255,0.10)",
              "--swiper-scrollbar-drag-bg-color": "#87DEDA",
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

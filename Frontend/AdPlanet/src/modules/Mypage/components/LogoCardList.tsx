// src/pages/archive/components/LogoCardList.tsx
import { useEffect, useMemo, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel, Scrollbar } from "swiper/modules";
import { LogoCard } from "./LogoCard";
import { getLogoList, getLogoDetail } from "../../../services/logoService";
import type {
  LogoListItem as LogoCardType,
  LogoListQuery,
  LogoDetail as DetailDto, // 상세 DTO 타입
} from "../../../services/dto/logo.dto";
import FlipCard from "./FlipCard";
import NeedLogin from "./NeedLogin";

/** 정렬 */
function parseOrder(v: string | null): LogoListQuery["order"] {
  return v === "OLDEST" ? "OLDEST" : "NEWEST"; 
}

/** 태그 ID */
function parseTagId(v: string | null): number | undefined {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

export interface LogoCardListHandle {
  handleExternalWheel: (deltaY: number) => void;
}

const LogoCardList = forwardRef<LogoCardListHandle>((props, ref) => {
  console.debug("[LogoCardList] mount");

  const [items, setItems] = useState<LogoCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  const [sp] = useSearchParams();

  const order: LogoListQuery["order"] = parseOrder(sp.get("order"));
  const tagId: number | undefined = parseTagId(sp.get("tagId"));

  useEffect(() => {
    console.debug("[LogoCardList] effect run");

    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        console.debug("[LogoCardList] fetch list", { order, tagId });

        const response = await getLogoList({ order, tagIds: tagId !== undefined ? [tagId] : [] }); // 서비스가 이미 Domain 배열 반환
        if (!alive) return;
        setItems(response.data ?? []);

        console.debug("[LogoCardList] fetched items:", response.data?.length ?? 0);
      } catch (e: any) {
        if (!alive) return;
        console.error("[LogoCardList] fetch error:", e?.message ?? e);

        // 401 에러 체크
        if (e?.response?.status === 401 || e?.message?.includes("401")) {
          setIsUnauthorized(true);
          setError(null);
        } else {
          setError(e instanceof Error ? e.message : "Failed to load logos");
          setIsUnauthorized(false);
        }
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

  // ===== 치수/스택 =====
  const WRAP_W = 560, WRAP_H = 480, STACK_W = 450;
  const OFFSET = 20, SCALE_STEP = 0.055, OP_STEP = 0.2, LAYERS = 4;

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
    pointerEvents: layer === 0 ? "auto" : "none", // top 카드만 상호작용 허용
  });

  // ---------------------------
  // 상세 프리페치/캐시
  // ---------------------------
  const [detailCache, setDetailCache] = useState<Record<number, DetailDto>>({});
  const [detailLoadingId, setDetailLoadingId] = useState<number | null>(null);
  const hoverTimer = useRef<number | null>(null);
  const inFlight = useRef<Record<number, boolean>>({});

  const prefetchDetail = async (logoId: number) => {
    if (detailCache[logoId] || inFlight.current[logoId]) return;
    try {
      inFlight.current[logoId] = true;
      setDetailLoadingId(logoId);
      const res = await getLogoDetail(logoId); // 실제 상세 불러오기
      setDetailCache((prev) => ({ ...prev, [logoId]: res.data }));
    } catch (e) {
      // 조용히 실패 허용 (뒷면엔 스켈레톤 유지)
    } finally {
      inFlight.current[logoId] = false;
      setDetailLoadingId((prev) => (prev === logoId ? null : prev));
    }
  };

  // ---------------------------
  // 뒷면 UI (실제 상세 데이터)
  // ---------------------------
  function BackFace({ detail, loading }: { detail?: DetailDto; loading: boolean }) {
    if (loading) {
      return (
        <div className="h-[400px] w-full rounded-2xl bg-white/90 text-[#111] shadow-lg p-6">
          <div className="h-5 w-32 bg-gray-300/70 rounded mb-3 animate-pulse" />
          <div className="h-12 w-full bg-gray-300/60 rounded mb-6 animate-pulse" />
          <div className="h-4 w-20 bg-gray-300/70 rounded mb-2 animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-full bg-gray-300/60 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-gray-300/60 rounded animate-pulse" />
            <div className="h-4 w-4/6 bg-gray-300/60 rounded animate-pulse" />
          </div>
        </div>
      );
    }
    return (
      <div className="h-[400px] w-full rounded-2xl bg-zinc-500 text-[#111] shadow-lg flex items-center justify-center p-6">
        <div className="text-left w-full">
          {detail?.slogan && (
            <>
              <p className="text-xs uppercase tracking-widest text-primary mb-2">Title</p>
              <h3 className="text-xl font-semibold mb-4 leading-snug line-clamp-2 text-white">
                {detail.slogan}
              </h3>
            </>
          )}
          {detail?.prompt && (
            <>
              <p className="text-xs uppercase tracking-widest text-primary mb-2">Prompt</p>
              <p className="text-sm leading-relaxed text-gray-800 whitespace-pre-wrap line-clamp-6">
                {detail.prompt}
              </p>
            </>
          )}
          {!detail?.slogan && !detail?.prompt && (
            <p className="text-sm text-gray-500">상세 정보가 없습니다.</p>
          )}
        </div>
      </div>
    );
  }

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

  // 전체 컨테이너 영역에서 휠 이벤트 캐치
  const containerRef = useRef<HTMLDivElement>(null);

  // 외부에서 호출할 수 있는 함수 노출
  useImperativeHandle(ref, () => ({
    handleExternalWheel: (deltaY: number) => {
      const sw = swiperRef.current;
      if (!sw) return;

      if (deltaY > 0) sw.slideNext();
      else sw.slidePrev();
    }
  }), []);

  const Overlay = () => {
    if (loading) return (
      <div className="absolute inset-0 z-30 flex items-center justify-center">
        <div className="animate-pulse text-slate-300">로딩 중…</div>
      </div>
    );
    if (isUnauthorized) return (
      <div className="absolute inset-0 z-30 flex items-center justify-center">
        <NeedLogin />
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

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        className="relative overflow-visible"
        style={{ width: WRAP_W, height: WRAP_H }}
        onWheel={handleWheel}         // 휠 이벤트 포워딩
      >
        <Overlay />

        {/* 전체 영역에서 스크롤 감지를 위한 투명 배경 */}
        <div
          className="absolute inset-0 z-15"
          onWheel={handleWheel}
          style={{ pointerEvents: 'auto' }}
        />

        {/* ====== 카드 스택(오버레이) ====== */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          {ghost && (
            <div style={ghostStyle} onTransitionEnd={onGhostEnd}>
              <LogoCard title={ghost.name} imgUrl={ghost.imgUrl} />
            </div>
          )}

          {stack.map(({ item, layer }) => {
            if (layer !== 0) {
              // 뒤쪽 카드들은 기존처럼 바로 LogoCard
              return (
                <div key={`${item.logoId}-${layer}`} style={layerStyle(layer)}>
                  <LogoCard
                    title={item.name}
                    imgUrl={item.imgUrl}
                    isActive={false}
                  />
                </div>
              );
            }

            // 맨 앞 카드: Hover 시 Flip + 상세 프리페치
            const detail = detailCache[item.logoId];
            const loadingDetail = detailLoadingId === item.logoId && !detail;

            return (
              <div
                key={`${item.logoId}-${layer}`}
                style={{ ...layerStyle(layer), pointerEvents: "auto" }}
                onMouseEnter={() => {
                  if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
                  hoverTimer.current = window.setTimeout(() => {
                    prefetchDetail(item.logoId); // hover 디바운스 후 프리페치
                  }, 120);
                }}
                onMouseLeave={() => {
                  if (hoverTimer.current) {
                    window.clearTimeout(hoverTimer.current);
                    hoverTimer.current = null;
                  }
                }}
                onClick={goDetail}      // 클릭 시 상세로 이동
                role="button"
                aria-label="상세 보기"
                title="상세 보기"
              >
                <FlipCard
                  width={STACK_W}
                  height={400}
                  front={<LogoCard title={item.name} imgUrl={item.imgUrl} isActive />}
                  back={<BackFace detail={detail} loading={loadingDetail} />}
                />
              </div>
            );
          })}
        </div>

        {/* ====== Swiper (입력/스크롤바) ====== */}
        <Swiper
          direction="vertical"
          modules={[Mousewheel, Scrollbar]}
          mousewheel={{ forceToAxis: true, releaseOnEdges: true }}
          scrollbar={{ draggable: true }}
          slidesPerView={1}
          speed={380}
          onSlideChange={(sw) => setActive(sw.activeIndex)}
          onSlideChangeTransitionStart={(sw) => handleSlideChangeStart(sw.activeIndex)}
          onSwiper={(sw) => (swiperRef.current = sw)}   // Swiper 인스턴스 보관
          className="absolute top-0 left-0 h-full w-full z-10"
          style={
            {
              "--swiper-scrollbar-size": "8px",
              "--swiper-scrollbar-right": "0.9rem",
              "--swiper-scrollbar-bg-color": "rgba(255,255,255,0.10)",
              "--swiper-scrollbar-drag-bg-color": "#87DEDA", 
              "--swiper-scrollbar-sides-offset": "0.75rem",
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
});

LogoCardList.displayName = 'LogoCardList';

export default LogoCardList;

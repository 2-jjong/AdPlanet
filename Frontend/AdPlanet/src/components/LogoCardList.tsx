import { useMemo, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel, Scrollbar } from "swiper/modules";
import { LogoCard } from "./LogoCard";

export default function LogoCardList() {
  const logos = ["Logo 1", "Logo 2", "Logo 3", "Logo 4", "Logo 5", "Logo 6"];

  const [active, setActive] = useState(0);
  const [ghost, setGhost] = useState<string | null>(null);
  const [ghostLeaving, setGhostLeaving] = useState(false);

  // ===== 치수 고정 =====
  const WRAP_W  = 480;  // 전체 보이는 너비
  const WRAP_H  = 480;  // 전체 보이는 높이
  const STACK_W = 400;  // 카드(LogoCard) 가로폭 (LogoCard h=400 → 정사각형)

  // ===== 스택 파라미터 =====
  const OFFSET = 28;
  const SCALE_STEP = 0.055;
  const OP_STEP = 0.2;
  const LAYERS = 4;

  const stack = useMemo(() => {
    const out: { title: string; layer: number }[] = [];
    for (let layer = 0; layer < LAYERS; layer++) {
      const idx = active + layer;
      if (idx >= logos.length) break;
      out.push({ title: logos[idx], layer });
    }
    return out;
  }, [active, logos]);

  const handleSlideChangeStart = (newIndex: number) => {
    const leaving = logos[active];
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

  return (
    // 보이는 영역 강제 지정 + 오른쪽 패딩으로 스크롤바 공간
    <div className="relative overflow-visible" style={{ width: WRAP_W, height: WRAP_H }}>
      {/* 스택(보이는 카드들) : Swiper 위에 올림, 입력은 Swiper가 받게 */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {ghost && (
          <div style={ghostStyle} onTransitionEnd={onGhostEnd}>
            <LogoCard title={ghost} />
          </div>
        )}
        {stack.map(({ title, layer }) => (
          <div key={`${title}-${layer}`} style={layerStyle(layer)}>
            <LogoCard title={title} />
          </div>
        ))}
      </div>

      {/* Swiper: 입력/휠/스크롤바만 담당. 컨테이너 크기를 부모에 맞춰서 고정 */}
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
            // 얇고 오른쪽에 살짝 띄운 스크롤바
            "--swiper-scrollbar-size": "10px",
            "--swiper-scrollbar-right": "0.75rem",
            "--swiper-scrollbar-bg-color": "rgba(255,255,255,0.10)",
            "--swiper-scrollbar-drag-bg-color": "#87DEDA",
            "--swiper-scrollbar-sides-offset": "2rem",
          } as React.CSSProperties
        }
      >
        {logos.map((_, i) => (
          // 슬라이드 높이를 '부모 높이 100%'로 — wrapper가 커도 컨테이너는 500px 유지
          <SwiperSlide key={i} className="!h-full">
            <div className="h-full opacity-0 pointer-events-none" />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

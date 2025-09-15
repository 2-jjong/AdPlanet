import { useState, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel, Scrollbar, EffectCreative } from "swiper/modules";
import { LogoCard } from "./LogoCard";

export default function LogoCardList() {
  const [active, setActive] = useState(0);
  const logos = ["Logo 1", "Logo 2", "Logo 3", "Logo 4", "Logo 5"];

  // ==== 스택 파라미터 (한 군데서만 조절) ====
  const ACTIVE_DROP = 80;     // 앞 카드 내려주는 값(px) = translate-y-20
  const STEP_Y      = 36;     // 뒤 카드 계단 간격(px) 32~40 사이 추천
  const DEPTH_Z     = 90;     // 한 계단당 뒤로 밀리는 깊이(px)
  const SCALE_NEAR  = 0.98;   // 바로 뒤 카드 스케일
  const SCALE_FAR   = 0.96;   // 그 다음 카드 스케일
  const LAYERS      = 4;      // 위로 보일 카드 층 수(3~5)

    const creative = useMemo(
    () => ({
      perspective: true,
      // 이전(위쪽) 카드: 한 계단
      prev: {
        translate: [0, -STEP_Y, -DEPTH_Z],
        scale: SCALE_NEAR,
        opacity: 0.95,
      },
      // 다음(원래 아래쪽) 카드도 위로 당겨서 뒤에서 보이게 (두 계단)
      next: {
        translate: [0, -STEP_Y * 2, -DEPTH_Z * 2],
        scale: SCALE_FAR,
        opacity: 0.9,
      },
      limitProgress: LAYERS,
      progressMultiplier: 1.0, // 과도한 이동 방지(필요 시 0.95~1.1 사이 조절)
    }),
    [STEP_Y, DEPTH_Z, SCALE_NEAR, SCALE_FAR, LAYERS]
  );

  return (
    <Swiper
      direction="vertical"
      modules={[Mousewheel, Scrollbar, EffectCreative]}
      mousewheel={{ forceToAxis: true, releaseOnEdges: true }}
      scrollbar={{ draggable: true }}
      slidesPerView={1}
      speed={500}
      effect="creative"
      creativeEffect={creative}
      // 카드 크기
      className="h-[500px] w-[500px] overflow-visible"
      spaceBetween={0}
      grabCursor
      // 스크롤바 위치/두께 살짝 다듬기 (컨테이너 안쪽으로 0.5rem)
      style={
        {
          "--swiper-scrollbar-right": "0.5rem",
          "--swiper-scrollbar-size": "8px",
        } as React.CSSProperties
      }
    >
      {logos.map((l, i) => (
        // 슬라이더와 카드 간 패딩
        <SwiperSlide key={i} className="box-border pr-10">
          <LogoCard title={l} isActive={i === active} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
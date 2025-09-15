import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel, Scrollbar, EffectCreative } from "swiper/modules";
import { LogoCard } from "./LogoCard";

export default function LogoCardList() {
  // 더미 데이터 - 로고 목록 출력
  const logos = ["Logo 1", "Logo 2", "Logo 3"];

  return (
    <Swiper
      direction="vertical"
      modules={[Mousewheel, Scrollbar, EffectCreative]}
      // mousewheel: forceToAxis - 스크롤 방향 고정
      // mousewheel: releaseOnEdges - 스크롤이 끝에 도달했을 때 스와이퍼 바깥으로 스크롤 가능
      mousewheel={{ forceToAxis: true, releaseOnEdges: true }}
      scrollbar={{ draggable: true }}
      slidesPerView={1}
      speed={500}
      effect="creative"
      creativeEffect={{
        perspective: true,
        // 위쪽으로만 살짝씩 겹치게 (값이 너무 크면 한 점에 겹쳐 보임)
        prev: { translate: [0, -22, -40], scale: 0.98, opacity: 0.95 },
        next: { translate: [0, -44, -80], scale: 0.96, opacity: 0.9 },
        limitProgress: 3, // 보일 겹침층 수
      }}
      className="h-[500px] w-[380px] pr-6 overflow-visible"
      spaceBetween={0}
      grabCursor
    >
      {logos.map((l, i) => (
        <SwiperSlide key={i} className="box-border">
          <LogoCard title={l} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

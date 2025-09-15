import { Swiper, SwiperSlide } from "swiper/react";
import { Scrollbar, Mousewheel } from "swiper/modules";
import PosterCard from "./PosterCard";
import React from "react";

export default function PosterCardList() {
  // 더미 데이터
  const posters = Array.from({ length: 12 }, (_, i) => ({
    id: `poster-${i + 1}`,
    title: `Poster ${i + 1}`,
    date: `2024.01.${String(i + 1).padStart(2, "0")}`,
  }));

  return (
    <div className="w-full">
      <Swiper
        // 가로 슬라이더 + 스크롤바
        modules={[Scrollbar, Mousewheel]}
        mousewheel={{ forceToAxis: true, releaseOnEdges: true }}
        scrollbar={{ draggable: true }}
        slidesPerView={1.1}          // 모바일에서 살짝 넘치게
        spaceBetween={48}
        breakpoints={{
          640:  { slidesPerView: 2,   spaceBetween: 48 },
          1024: { slidesPerView: 3,   spaceBetween: 64 },
          1280: { slidesPerView: 4,   spaceBetween: 72 },
        }}
        // 하단 스크롤바가 겹치지 않도록 여백
        className="pb-8"
        // 스크롤바 색상/두께 (Tailwind 변수처럼 inline으로 지정)
        style={
          {
            // @ts-ignore
            "--swiper-scrollbar-bg-color": "rgba(255,255,255,0.12)",
            "--swiper-scrollbar-drag-bg-color": "#87DEDA",
            "--swiper-scrollbar-size": "10px",
            "--swiper-scrollbar-bottom": "8px",
            "--swiper-scrollbar-sides-offset": "1.5%",
          } as React.CSSProperties
        }
      >
        {posters.map((p) => (
          <SwiperSlide key={p.id} className="!h-auto">
            <PosterCard item={p} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

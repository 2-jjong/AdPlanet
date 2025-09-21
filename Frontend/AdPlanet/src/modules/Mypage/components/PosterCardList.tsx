// src/modules/Mypage/components/PosterCardList.tsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Scrollbar, Mousewheel } from "swiper/modules";
import { getPosterGroups } from "../../../services/posterService";
import type { PosterGroupItem } from "../../../services/dto/poster.dto";
import { PosterCard } from "./PosterCard";
import { toAbsolute } from "../../../utils/posterParser"; 



export default function PosterCardList() {
  const [items, setItems] = useState<PosterGroupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setError("");
        setLoading(true);

        // TODO : ArchiveToolbar 쿼리 반영 (latest -> newest)
        const orderParam = (params.get("order") || "LATEST") as "LATEST" | "OLDEST";
        // const orderParam = (params.get("order") || "NEWEST") as "NEWEST" | "OLDEST";
        const tagIdParam = params.get("tagId");

        const res = await getPosterGroups({
          order: orderParam,
          tagId: tagIdParam ? Number(tagIdParam) : undefined,
        });

        if (!alive) return;
        setItems(res.data ?? []);
      } catch (e: any) {
        if (!alive) return;
        console.error("[PosterCardList] fetch error:", e?.response || e);
        setError("포스터 목록을 불러오지 못했어요.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [params]);

  if (error) {
    return (
      <div className="w-full py-10 text-center">
        <p className="text-red-400 mb-3">{error}</p>
        <button
          className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600"
          onClick={() => {
            // 간단 리트라이: 쿼리 변경 트리거가 없으니 location.reload로 간단하게 처리
            location.reload();
          }}
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Swiper
        modules={[Scrollbar, Mousewheel]}
        mousewheel={{ releaseOnEdges: true }}
        freeMode={{ enabled: false, sticky: true }}
        scrollbar={{ draggable: true }}
        slidesPerView={1.1}
        spaceBetween={48}
        breakpoints={{
          640: { slidesPerView: 2, spaceBetween: 48 },
          1024: { slidesPerView: 3, spaceBetween: 64 },
          1280: { slidesPerView: 4, spaceBetween: 72 },
        }}
        style={
          {
            // @ts-ignore – CSS 변수 전달
            "--swiper-scrollbar-size": "10px",
            "--swiper-scrollbar-bottom": "8px",
            "--swiper-scrollbar-sides-offset": "2.5%",
          } as React.CSSProperties
        }
        observer
        observeParents
        resizeObserver
      >
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <SwiperSlide key={`skeleton-${i}`} className="!h-auto pb-12">
                <div className="animate-pulse h-72 w-full rounded-2xl bg-slate-800 border border-slate-700/60" />
              </SwiperSlide>
            ))
          : items.map((it) => (
              <SwiperSlide key={it.posterGroupId} className="!h-auto pb-14">
                {/* 카드 전체 클릭시 상세로 이동 */}
                <button
                  type="button"
                  onClick={() => navigate(`/archive/poster/${it.posterGroupId}`)}
                  className="block w-full text-left cursor-pointer focus:outline-none"
                  title={it.title}
                >
                  <PosterCard
                    title={it.title}
                    imgUrl={toAbsolute(it.imgUrl)} 
                  />
                </button>
              </SwiperSlide>
            ))}
      </Swiper>
    </div>
  );
}

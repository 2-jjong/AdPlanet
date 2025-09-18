// import { Swiper, SwiperSlide } from "swiper/react";
// import { Scrollbar, Mousewheel } from "swiper/modules";
// import PosterCard from "./PosterCard";
// import React, { useEffect, useMemo, useState } from "react";
// import { getPosterGroups } from "../services/posterService";
// import type { PosterGroupResponse } from "../types/poster";

// type PosterCardItem = {
//   id: string;
//   title: string;    // 카드 타이틀
//   date: string;     // YYYY.MM.DD
//   imgUrl?: string;  // 대표 이미지
//   count?: number;   // history 개수
// };

// const formatDate = (iso: string) => {
//   const d = new Date(iso);
//   const y = d.getFullYear();
//   const m = String(d.getMonth() + 1).padStart(2, "0");
//   const day = String(d.getDate()).padStart(2, "0");
//   return `${y}.${m}.${day}`;
// };
// const ellipsize = (t: string, n = 22) => (t.length > n ? t.slice(0, n) + "…" : t);

// export default function PosterCardList() {
//   const [groups, setGroups] = useState<PosterGroupResponse[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       try {
//         setLoading(true);
//         const res = await getPosterGroups();
//         if (alive) setGroups(res);
//       } catch (e: any) {
//         if (alive) setError(e?.message ?? "포스터 목록을 불러오지 못했습니다.");
//       } finally {
//         if (alive) setLoading(false);
//       }
//     })();
//     return () => { alive = false; };
//   }, []);

//   const items: PosterCardItem[] = useMemo(
//     () =>
//       groups.map((g) => ({
//         id: String(g.posterGroupId),
//         title: ellipsize(g.prompt || "무제 포스터"),
//         date: formatDate(g.createdAt),
//         imgUrl: g.imgUrl,
//         count: g.history?.length ?? 0,
//       })),
//     [groups]
//   );

//   if (error) {
//     return (
//       <div className="w-full py-10 text-center">
//         <p className="text-red-400 mb-3">{error}</p>
//         <button
//           className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600"
//           onClick={async () => {
//             try {
//               setError(null);
//               setLoading(true);
//               const res = await getPosterGroups();
//               setGroups(res);
//             } catch (e: any) {
//               setError(e?.message ?? "불러오기 실패");
//             } finally {
//               setLoading(false);
//             }
//           }}
//         >
//           다시 시도
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full">
//       <Swiper
//         modules={[Scrollbar, Mousewheel]}
//         mousewheel={{ releaseOnEdges: true }}
//         freeMode={{ enabled: false, sticky: true }}
//         scrollbar={{ draggable: true }}
//         slidesPerView={1.1}
//         spaceBetween={48}
//         breakpoints={{
//           640:  { slidesPerView: 2, spaceBetween: 48 },
//           1024: { slidesPerView: 3, spaceBetween: 64 },
//           1280: { slidesPerView: 4, spaceBetween: 72 },
//         }}
//         style={
//           {
//             // @ts-ignore
//             "--swiper-scrollbar-size": "10px",
//             "--swiper-scrollbar-bottom": "8px",
//             "--swiper-scrollbar-sides-offset": "2.5%",
//           } as React.CSSProperties
//         }
//         observer
//         observeParents
//         resizeObserver
//       >
//         {loading
//           ? Array.from({ length: 8 }).map((_, i) => (
//               <SwiperSlide key={`skeleton-${i}`} className="!h-auto pb-12">
//                 <div className="animate-pulse h-72 w-full rounded-2xl bg-slate-800 border border-slate-700/60" />
//               </SwiperSlide>
//             ))
//           : items.map((p) => (
//               <SwiperSlide key={p.id} className="!h-auto pb-12">
//                 <PosterCard item={p} />
//               </SwiperSlide>
//             ))}
//       </Swiper>
//     </div>
//   );
// }

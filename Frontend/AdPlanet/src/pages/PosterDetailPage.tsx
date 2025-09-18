// import { useEffect, useMemo, useState } from "react";
// import { useParams } from "react-router-dom";
// import Navigation from "../components/Navigation";
// import { RoundButton } from "../components/RoundButton";
// import { getPosterGroupDetail } from "../services/posterService";
// import type { PosterGroupDetail } from "../types/poster";

// // Fullpage
// 'use client';
// import { FullpageContainer, FullpageSection } from '@shinyongjun/react-fullpage';
// import '@shinyongjun/react-fullpage/css'

// // Swiper
// import { Swiper, SwiperSlide } from "swiper/react";
// import { Navigation as SwNav, Keyboard, Mousewheel } from "swiper/modules";
// import "swiper/css";
// import "swiper/css/navigation";


// export default function PosterDetailPage() {
//   const { id } = useParams();
//   const groupId = useMemo(() => Number(id), [id]);

//   const [data, setData] = useState<PosterGroupDetail | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [activeIndex, setActiveIndex] = useState(0);

//   useEffect(() => {
//     let alive = true;
//     if (!Number.isFinite(groupId)) {
//       setError("잘못된 포스터 그룹 ID 입니다.");
//       setLoading(false);
//       return;
//     }
//     (async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         const detail = await getPosterGroupDetail(groupId);
//         if (!alive) return;
//         setData(detail);
//       } catch (e: any) {
//         if (!alive) return;
//         setError(e?.message ?? "상세 정보를 불러오지 못했습니다.");
//       } finally {
//         if (!alive) return;
//         setLoading(false);
//       }
//     })();
//     return () => { alive = false; };
//   }, [groupId]);

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-background text-slate-200">
//         <Navigation />
//         <main className="px-6 pt-6 pb-24 max-w-7xl mx-auto">
//           <div className="animate-pulse text-slate-300">불러오는 중…</div>
//         </main>
//       </div>
//     );
//   }
//   if (error || !data) {
//     return (
//       <div className="min-h-screen bg-background text-slate-200">
//         <Navigation />
//         <main className="px-6 pt-6 pb-24 max-w-7xl mx-auto space-y-4">
//           <header className="flex items-center justify-between">
//             <h1 className="text-2xl font-semibold">포스터 상세</h1>
//           </header>
//           <div className="rounded-2xl bg-red-900/20 border border-red-800 px-4 py-3 text-red-200 text-sm">
//             {error ?? "상세 정보를 불러오지 못했습니다."}
//           </div>
//         </main>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-background text-slate-200 font-jamsil">
//       <Navigation />

//       <FullpageContainer activeIndex={activeIndex} setActiveIndex={setActiveIndex}>
//         {/* SECTION 1 — 포스터 상세 */}
//         <FullpageSection>
//           <div className="mx-auto w-full max-w-7xl px-6 py-8">
//             {/* 헤더 */}
//             <header className="mb-8 flex items-center justify-between">
//               <h1 className="text-3xl font-extrabold tracking-tight">
//                 <span className="text-primary">{data.prompt}</span>
//                 <span className="ml-1">의 포스터</span>
//               </h1>
//               {/* 필요 시 뒤로 버튼 활성화
//               <Link to="/archive/poster" className="rounded-xl px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700">뒤로</Link>
//               */}
//             </header>

//             {/* 본문 2열 */}
//             <div className="grid grid-cols-12 gap-10 items-start">
//               {/* 좌: 대표 포스터 */}
//               <section className="col-span-12 lg:col-span-6">
//                 <div className="rounded-[36px] bg-slate-900/40 border border-slate-800 p-6">
//                   <div className="w-full aspect-[3/4] overflow-hidden rounded-[28px] bg-slate-950">
//                     <img
//                       src={data.imgUrl}
//                       alt="대표 포스터"
//                       className="h-full w-full object-cover"
//                       loading="eager"
//                     />
//                   </div>
//                 </div>
//               </section>

//               {/* 우: 슬로건 / 프롬프트 */}
//               <section className="col-span-12 lg:col-span-6 space-y-8">
//                 <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6">
//                   <h2 className="text-xl font-bold text-primary">슬로건(선택사항)</h2>
//                   <p className="mt-3 text-lg leading-relaxed">{data.title || "—"}</p>
//                 </div>

//                 <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6">
//                   <h2 className="text-xl font-bold text-primary">프롬프트</h2>
//                   <p className="mt-3 whitespace-pre-wrap leading-relaxed">{data.content}</p>
//                 </div>

//                 <div className="flex justify-end gap-3">
//                   <RoundButton text="Export" variant="outline" />
//                 </div>
//               </section>
//             </div>
//           </div>
//         </FullpageSection>

//         {/* SECTION 2 — 작업 기록 */}
//         <FullpageSection>
//           <div className="mx-auto w-full max-w-7xl px-6 py-8">
//             <div className="mb-6 flex items-center justify-between">
//               <h2 className="text-3xl font-extrabold tracking-tight">작업 기록</h2>
//             </div>

//             <Swiper
//               modules={[SwNav, Keyboard, Mousewheel]}
//               navigation
//               keyboard={{ enabled: true }}
//               mousewheel={{ forceToAxis: true }}
//               spaceBetween={24}
//               slidesPerView={1.15}
//               breakpoints={{
//                 640:  { slidesPerView: 2.15 },
//                 1024: { slidesPerView: 3.15 },
//                 1280: { slidesPerView: 4.15 },
//               }}
//               className="!pb-10"
//             >
//               {data.history.map(h => (
//                 <SwiperSlide key={h.posterId}>
//                   <HistoryCard imgUrl={h.imgUrl} prompt={h.prompt} />
//                 </SwiperSlide>
//               ))}
//             </Swiper>

//             <div className="mt-6 flex justify-end">
//               <RoundButton text="Export" variant="outline" />
//             </div>
//           </div>
//         </FullpageSection>
//       </FullpageContainer>
//     </div>
//   );
// }

// /* 하위 컴포넌트 */
// function HistoryCard({ imgUrl, prompt }: { imgUrl: string; prompt: string }) {
//   return (
//     <div className="group rounded-3xl bg-white/5 border border-white/10 p-4 h-[360px] flex flex-col">
//       <div className="relative rounded-2xl overflow-hidden bg-white/10 aspect-[3/4]">
//         <img src={imgUrl} alt="히스토리 포스터" className="h-full w-full object-cover" loading="lazy" />
//         <div className="absolute bottom-3 right-3 size-7 grid place-items-center rounded-full bg-black/40 backdrop-blur">
//           <Lock className="w-4 h-4" />
//         </div>
//       </div>
//       <div className="mt-4 text-sm text-white/80 line-clamp-2 min-h-[2.6em]">{prompt}</div>
//       <div className="mt-auto pt-3">
//         <div className="h-[3px] w-10 rounded-full bg-white/20" />
//       </div>
//     </div>
//   );
// }

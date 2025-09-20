// src/modules/Mypage/pages/PosterDetailPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Navigation from "../../../components/Layout/Navigation";
import { RoundButton } from "../../../components/UI/Button/RoundButton";
import { getPosterGroupDetail, getPoster } from "../../../services/posterService";
import type { PosterGroupDetail, PosterDetail as PosterDetailDto } from "../../../services/dto/poster.dto";

// Fullpage
'use client';
import { FullpageContainer, FullpageSection } from '@shinyongjun/react-fullpage';
import '@shinyongjun/react-fullpage/css'

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation as SwNav, Keyboard, Mousewheel } from "swiper/modules";

// 로컬 보조: 상대경로 이미지를 절대경로로 보정
const toAbsolute = (url?: string | null) => {
  if (!url) return "";
  if (/^(https?:)?\/\//.test(url) || url.startsWith("data:")) return url;
  return url.startsWith("/") ? url : `/${url}`;
};

export default function PosterDetailPage() {
  const { id } = useParams();
  const groupId = useMemo(() => Number(id), [id]);

  const [data, setData] = useState<PosterGroupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 화면 상태
  const [activeIndex, setActiveIndex] = useState(0);

  // 선택 포스터(히어로 영역)
  const [heroUrl, setHeroUrl] = useState<string>("");
  const [selectedPosterId, setSelectedPosterId] = useState<number | null>(null);
  const [selectedPoster, setSelectedPoster] = useState<PosterDetailDto | null>(null); // prompt 포함

  // 1) 그룹 상세
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        if (!Number.isFinite(groupId)) throw new Error("잘못된 포스터 그룹 ID 입니다.");

        const res = await getPosterGroupDetail(groupId); // { code, data }
        if (!alive) return;

        const d = res.data;
        setData(d);

        // 기본 히어로 = 그룹 대표 이미지
        setHeroUrl(toAbsolute(d.imgUrl));

        // 히스토리의 첫 포스터를 기본 선택 (있으면)
        const first = d.history?.[0];
        setSelectedPosterId(first ? first.posterId : null);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? "상세 정보를 불러오지 못했습니다.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [groupId]);

  // 2) 선택 포스터 상세(프롬프트) 로드
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!selectedPosterId) {
        setSelectedPoster(null);
        return;
      }
      try {
        const res = await getPoster(selectedPosterId); // { code, data }
        if (!alive) return;
        setSelectedPoster(res.data ?? null);
      } catch {
        if (!alive) return;
        setSelectedPoster(null);
      }
    })();
    return () => { alive = false; };
  }, [selectedPosterId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-slate-200">
        <Navigation />
        <main className="px-6 pt-6 pb-24 max-w-7xl mx-auto">
          <div className="animate-pulse text-slate-300">불러오는 중…</div>
        </main>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background text-slate-200">
        <Navigation />
        <main className="px-6 pt-6 pb-24 max-w-7xl mx-auto space-y-4">
          <header className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">포스터 상세</h1>
            <a href="/archive?view=poster" className="rounded-xl px-3 py-2 bg-slate-800 hover:bg-slate-700">
              뒤로
            </a>
          </header>
          <div className="rounded-2xl bg-red-900/20 border border-red-800 px-4 py-3 text-red-200 text-sm">
            {error ?? "상세 정보를 불러오지 못했습니다."}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-slate-200">
      <Navigation />
      <FullpageContainer activeIndex={activeIndex} setActiveIndex={setActiveIndex}>
        {/* SECTION 1: 히어로 + 우측 정보 */}
        <FullpageSection>
          <div className="font-jamsil mx-auto w-full max-w-7xl px-6 py-8">
            <header className="mb-8 flex items-center justify-between">
              <h1 className="text-3xl font-extrabold tracking-tight">
                <span className="text-primary">{data.title}</span>
                <span className="ml-1">의 포스터</span>
              </h1>
              <a href="/archive?view=poster" className="rounded-xl px-3 py-2 bg-slate-800 hover:bg-slate-700">
                목록
              </a>
            </header>

            <div className="grid grid-cols-12 gap-10 items-start">
              {/* 좌: 히어로 (3:4) */}
              <section className="col-span-12 lg:col-span-7">
                <div className="rounded-[36px] bg-slate-900/40 border border-slate-800 p-6">
                  <div className="w-full overflow-hidden rounded-[28px] bg-slate-950 aspect-[3/4]">
                    {heroUrl ? (
                      <img
                        src={heroUrl}
                        alt={data.title || "포스터"}
                        className="w-full h-full object-cover"
                        loading="eager"
                      />
                    ) : (
                      <div className="w-full h-full" />
                    )}
                  </div>
                </div>
              </section>

              {/* 우: 슬로건 + 프롬프트 + Export */}
              <section className="col-span-12 lg:col-span-5 space-y-8">
                {!!data.content && (
                  <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6">
                    <h2 className="text-xl font-bold text-primary">슬로건(선택사항)</h2>
                    <p className="mt-3 text-lg leading-relaxed whitespace-pre-wrap">{data.content}</p>
                  </div>
                )}

                <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6">
                  <h2 className="text-xl font-bold text-primary">프롬프트</h2>
                  <p className="mt-3 whitespace-pre-wrap leading-relaxed">
                    {selectedPoster?.prompt ?? "선택된 포스터의 프롬프트가 없습니다."}
                  </p>
                </div>

                <div className="flex justify-end">
                  <RoundButton text="Export" variant="outline" />
                </div>
              </section>
            </div>
          </div>
        </FullpageSection>

        {/* SECTION 2: 작업 기록 (히스토리) */}
        <FullpageSection>
          <div className="font-jamsil mx-auto w-full max-w-7xl px-6 py-8">
            <h2 className="text-3xl font-extrabold tracking-tight mb-6">작업 기록</h2>

            <div className="relative">
              <button
                id="histPrev"
                className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-700 flex items-center justify-center"
                aria-label="이전"
                title="이전"
              >
                ‹
              </button>
              <button
                id="histNext"
                className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-700 flex items-center justify-center"
                aria-label="다음"
                title="다음"
              >
                ›
              </button>

              <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6">
                <Swiper
                  modules={[SwNav, Keyboard, Mousewheel]}
                  navigation={{ prevEl: "#histPrev", nextEl: "#histNext" }}
                  keyboard={{ enabled: true }}
                  mousewheel={{ forceToAxis: true }}
                  slidesPerView={1.4}
                  spaceBetween={24}
                  breakpoints={{
                    640: { slidesPerView: 2.2, spaceBetween: 28 },
                    1024: { slidesPerView: 3.2, spaceBetween: 36 },
                    1280: { slidesPerView: 4.2, spaceBetween: 40 },
                  }}
                >
                  {(data.history ?? []).map((p) => (
                    <SwiperSlide key={p.posterId} className="!h-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setHeroUrl(toAbsolute(p.imgUrl));
                          setSelectedPosterId(p.posterId);
                          setActiveIndex(0); // 필요 없으면 제거
                        }}
                        className="group block w-full text-left"
                        title="미리보기"
                      >
                        <div className="relative rounded-2xl overflow-hidden border border-slate-800 group-hover:border-primary/60 transition-colors">
                          <img
                            src={toAbsolute(p.imgUrl)}
                            alt={`${data.title}-${p.posterId}`}
                            className="w-full aspect-[3/4] object-cover"
                            loading="lazy"
                          />
                        </div>
                        {data.content && (
                          <p className="mt-2 text-sm text-slate-300 line-clamp-1">{data.content}</p>
                        )}
                      </button>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>
          </div>
        </FullpageSection>
      </FullpageContainer>
    </div>
  );
}

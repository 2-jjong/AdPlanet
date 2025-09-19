// LogoDetailPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navigation from "../../../components/Layout/Navigation";
import CiGuideline from "../components/CiGuideline";
import CiGuidelineUnavailable from "../components/CiGuideline_unavailable";
import { LogoCard } from "../components/LogoCard";
import { RoundButton } from "../../../components/UI/Button/RoundButton";

import { getLogoDetail, getCiGuideline, createCiGuideline } from "../../../services/logoService";
import type { LogoDetail as DetailDto, CiGuideline as CiDto } from "../../../services/dto/logo.dto";

// React Fullpage 라이브러리
("use client");
import { FullpageContainer, FullpageSection } from "@shinyongjun/react-fullpage";
import "@shinyongjun/react-fullpage/css";

// ──────────────────────────────────────────────────────────────────────
// CiGuideline 컴포넌트가 기대하던 더미 타입(필수 필드) 맞춰주는 어댑터
type ColorSpec = { name: string; hex: string; rgb?: string; cmyk?: string; note?: string };
type CiGuidelineData = {
  basicRules: string[];
  minSize: { widthMm: number; dpiPx: number };
  marginRules: string[];
  backgroundRules: string[];
  palette: { primary: ColorSpec[]; secondary: ColorSpec[]; neutral: ColorSpec[] };
};

// dto → 컴포넌트용으로 최소 파싱
const splitLines = (s?: string) =>
  s
    ? s
        .split(/\r?\n/)
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

const pickNum = (s: string | undefined, re: RegExp) => {
  const m = s?.match(re);
  return m ? Number(m[1]) : 0;
};

const toHex = (h?: string) => {
  if (!h) return undefined;
  const m = h.match(/#[0-9a-f]{6}/i)?.[0];
  if (m) return m;
  // "#RRGGBB"가 아니면 그대로 둘 수도 있지만, 안전하게 "#" 붙이기 시도
  return h.startsWith("#") ? h : `#${h}`;
};

function adaptCiGuideline(ci?: CiDto | null): CiGuidelineData {
  const pHex = toHex(ci?.primaryColor);
  const sHex = toHex(ci?.secondaryColor);
  const nHex = toHex(ci?.neutralColor);

  const primary: ColorSpec[] = pHex ? [{ name: "Primary", hex: pHex, note: ci?.primaryGuide }] : [];
  const secondary: ColorSpec[] = sHex
    ? [{ name: "Secondary", hex: sHex, note: ci?.secondaryGuide }]
    : [];
  const neutral: ColorSpec[] = nHex ? [{ name: "Neutral", hex: nHex, note: ci?.neutralGuide }] : [];

  return {
    basicRules: splitLines(ci?.basicLogo),
    marginRules: splitLines(ci?.marginRule),
    backgroundRules: splitLines(ci?.backgroundRule),
    minSize: {
      widthMm: pickNum(ci?.minSize, /([\d.]+)\s*mm/i),
      dpiPx: pickNum(ci?.minSize, /([\d.]+)\s*px/i),
    },
    palette: { primary, secondary, neutral },
  };
}
// ──────────────────────────────────────────────────────────────────────

export default function LogoDetailPage() {
  const { id } = useParams();
  const logoId = useMemo(() => Number(id), [id]);

  const [detail, setDetail] = useState<DetailDto | null>(null);
  const [ci, setCi] = useState<CiDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // CI 생성 상태
  const [creatingCi, setCreatingCi] = useState(false);
  const [ciCreateError, setCiCreateError] = useState<string | null>(null);

  // Fullpage 관련 상태
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // DTO 기준으로 CI 유무 판정
  const hasCi = useMemo(() => {
    if (!ci) return false;
    const hasRules =
      splitLines(ci.basicLogo).length > 0 ||
      splitLines(ci.marginRule).length > 0 ||
      splitLines(ci.backgroundRule).length > 0;
    const hasPalette =
      !!toHex(ci.primaryColor) || !!toHex(ci.secondaryColor) || !!toHex(ci.neutralColor);
    return hasRules || hasPalette;
  }, [ci]);

  // CI 가이드라인이 없는 경우 생성하기
  const handleCreateGuideline = async () => {
    if (!Number.isFinite(logoId)) return;
    try {
      setCiCreateError(null);
      setCreatingCi(true);

      await createCiGuideline(logoId); // 바디 없이 POST
      const fresh = await getCiGuideline(logoId); // 재조회 (DTO 반환)
      setCi(fresh.data);
      setActiveIndex(1);
    } catch (e: any) {
      console.error("[CI create] ", e?.response?.status, e?.response?.data || e);
      setCiCreateError(e?.message ?? "CI 가이드라인 생성에 실패했습니다.");
    } finally {
      setCreatingCi(false);
    }
  };

  // 데이터 로드
  useEffect(() => {
    let alive = true;
    if (!Number.isFinite(logoId)) {
      setError("잘못된 로고 ID 입니다.");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setError(null);

        // 상세 + CI를 병렬로 (한쪽 실패해도 다른쪽은 살림)
        const [dRes, ciRes] = await Promise.allSettled([
          getLogoDetail(logoId),
          getCiGuideline(logoId),
        ]);

        if (!alive) return;

        if (dRes.status === "fulfilled") setDetail(dRes.value.data);
        if (ciRes.status === "fulfilled") setCi(ciRes.value.data);

        if (dRes.status === "rejected" && ciRes.status === "rejected") {
          throw dRes.reason ?? ciRes.reason ?? new Error("상세 정보를 불러오지 못했습니다.");
        }
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? "상세 정보를 불러오지 못했습니다.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [logoId]);

  // 로딩/에러 화면
  if (loading) {
    return (
      <div className='min-h-screen bg-[#12141f] text-slate-200'>
        <Navigation />
        <main className='px-6 pt-6 pb-24 max-w-7xl mx-auto'>
          <div className='animate-pulse text-slate-300'>불러오는 중…</div>
        </main>
      </div>
    );
  }
  if (error || !detail) {
    return (
      <div className='min-h-screen bg-[#12141f] text-slate-200'>
        <Navigation />
        <main className='px-6 pt-6 pb-24 max-w-7xl mx-auto space-y-4'>
          <header className='flex items-center justify-between'>
            <h1 className='text-2xl font-semibold'>로고 상세</h1>
            <Link
              to='/archive/logo'
              className='rounded-xl px-3 py-2 bg-slate-800 hover:bg-slate-700'
            >
              뒤로
            </Link>
          </header>
          <div className='rounded-2xl bg-red-900/20 border border-red-800 px-4 py-3 text-red-200 text-sm'>
            {error ?? "상세 정보를 불러오지 못했습니다."}
          </div>
        </main>
      </div>
    );
  }

  const ciForComponent = adaptCiGuideline(ci);

  return (
    <div className='min-h-screen bg-background text-slate-200'>
      <Navigation />

      {/* Fullpage는 뷰포트 전체를 쓰므로, 섹션 안에서 컨테이너를 별도로 둔다 */}
      <FullpageContainer activeIndex={activeIndex} setActiveIndex={setActiveIndex}>
        {/* SECTION 1 — 로고 상세 */}
        <FullpageSection>
          <div className='font-jamsil mx-auto w-full max-w-7xl px-6 py-8'>
            {/* 헤더 */}
            <header className='mb-8 flex items-center justify-between'>
              <h1 className='text-3xl font-extrabold tracking-tight'>
                <span className='text-primary'>{detail.name}</span>
                <span className='ml-1'>의 로고</span>
              </h1>
            </header>

            {/* 본문 2열 */}
            <div className='grid grid-cols-12 gap-10 items-start'>
              {/* 좌: 로고 큰 카드 */}
              <section className='col-span-12 lg:col-span-6'>
                <div className='rounded-[36px] bg-slate-900/40 border border-slate-800 p-6'>
                  <div className='aspect-square w-full overflow-hidden rounded-[28px] bg-slate-950'>
                    {/* ✅ DTO 필드명 사용: imgUrl */}
                    <LogoCard imgUrl={detail.imgUrl} title={detail.name} isActive />
                  </div>
                </div>
              </section>

              {/* 우: 슬로건 / 프롬프트 */}
              <section className='col-span-12 lg:col-span-6 space-y-8'>
                {detail.slogan && (
                  <div className='rounded-2xl bg-slate-900/60 border border-slate-800 p-6'>
                    <h2 className='text-xl font-bold text-primary'>슬로건(선택사항)</h2>
                    <p className='mt-3 text-lg leading-relaxed'>{detail.slogan}</p>
                  </div>
                )}
                {detail.prompt && (
                  <div className='rounded-2xl bg-slate-900/60 border border-slate-800 p-6'>
                    <h2 className='text-xl font-bold text-primary'>프롬프트</h2>
                    <p className='mt-3 whitespace-pre-wrap leading-relaxed'>{detail.prompt}</p>
                  </div>
                )}
              </section>
            </div>
          </div>
        </FullpageSection>

        {/* SECTION 2 — CI 가이드라인 */}
        <FullpageSection>
          <div className='font-jamsil mx-auto w-full max-w-7xl px-6 py-8'>
            <div className='mb-6 flex items-center justify-between'>
              <h2 className='text-3xl font-extrabold tracking-tight'>CI 가이드라인</h2>
              <RoundButton text='편집' variant='outline' />
            </div>

            {/* 생성 실패 배너 */}
            {ciCreateError && (
              <div className='mb-4 rounded-xl border border-red-800 bg-red-900/30 px-4 py-3 text-red-200 text-sm'>
                {ciCreateError}
              </div>
            )}

            {/* 데이터 유무에 따른 분기 */}
            {hasCi ? (
              <CiGuideline data={ciForComponent} />
            ) : (
              <CiGuidelineUnavailable creating={creatingCi} onCreate={handleCreateGuideline} />
            )}

            <div className='mt-6 flex justify-end'>
              <RoundButton text='Export' variant='outline' />
            </div>
          </div>
        </FullpageSection>
      </FullpageContainer>
    </div>
  );
}


import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import { LogoCard } from "../components/LogoCard";
import CiGuideline from "../components/CiGuideline";

import { getLogoDetail, getCiGuideline } from "../services/logoService";
import type { LogoDetail as DetailDomain, CiGuideline as CiDomain } from "../types/logo";

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

function adaptCiGuideline(ci?: CiDomain | null): CiGuidelineData {
  const primary = ci?.palette.primary
    ? [{ name: ci.palette.primary.name ?? "Primary", hex: ci.palette.primary.hex, note: ci.palette.primary.guide }]
    : [];
  const secondary = ci?.palette.secondary
    ? [{ name: ci.palette.secondary.name ?? "Secondary", hex: ci.palette.secondary.hex, note: ci.palette.secondary.guide }]
    : [];
  const neutral = ci?.palette.neutral
    ? [{ name: ci.palette.neutral.name ?? "Neutral", hex: ci.palette.neutral.hex, note: ci.palette.neutral.guide }]
    : [];

  return {
    basicRules: ci?.logoGuideLines ?? [],
    minSize: { widthMm: 0, dpiPx: 0 },        // 서버에 값 없으니 기본값
    marginRules: [],                           // 서버에 값 없으니 기본값
    backgroundRules: [],                       // 서버에 값 없으니 기본값
    palette: { primary, secondary, neutral },
  };
}
// ──────────────────────────────────────────────────────────────────────

export default function LogoDetailPage() {
  const { id } = useParams();
  const logoId = useMemo(() => Number(id), [id]);

  const [detail, setDetail] = useState<DetailDomain | null>(null);
  const [ci, setCi] = useState<CiDomain | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        if (dRes.status === "fulfilled") setDetail(dRes.value);
        if (ciRes.status === "fulfilled") setCi(ciRes.value);

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

    return () => { alive = false; };
  }, [logoId]);

  // 로딩/에러 화면
  if (loading) {
    return (
      <div className="min-h-screen bg-[#12141f] text-slate-200">
        <Navigation />
        <main className="px-6 pt-6 pb-24 max-w-7xl mx-auto">
          <div className="animate-pulse text-slate-300">불러오는 중…</div>
        </main>
      </div>
    );
  }
  if (error || !detail) {
    return (
      <div className="min-h-screen bg-[#12141f] text-slate-200">
        <Navigation />
        <main className="px-6 pt-6 pb-24 max-w-7xl mx-auto space-y-4">
          <header className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">로고 상세</h1>
            <Link to="/archive/logo" className="rounded-xl px-3 py-2 bg-slate-800 hover:bg-slate-700">뒤로</Link>
          </header>
          <div className="rounded-2xl bg-red-900/20 border border-red-800 px-4 py-3 text-red-200 text-sm">
            {error ?? "상세 정보를 불러오지 못했습니다."}
          </div>
        </main>
      </div>
    );
  }

  const ciForComponent = adaptCiGuideline(ci);

  return (
    <div className="min-h-screen bg-[#12141f] text-slate-200">
      <Navigation />
      <main className="px-6 pt-6 pb-24 max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">{detail.name}의 로고</h1>
          <Link to="/archive/logo" className="rounded-xl px-3 py-2 bg-slate-800 hover:bg-slate-700">뒤로</Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 좌측: 썸네일 + 슬로건/프롬프트 */}
          <section className="space-y-6">
            <LogoCard imgUrl={detail.imageUrl} title={detail.name} />
            {(detail.slogan || detail.prompt) && (
              <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5">
                {detail.slogan && (
                  <>
                    <h2 className="text-lg font-semibold mb-2">슬로건</h2>
                    <p>{detail.slogan}</p>
                    <div className="my-4 h-px bg-slate-800" />
                  </>
                )}
                {detail.prompt && (
                  <>
                    <h2 className="text-lg font-semibold mb-2">프롬프트</h2>
                    <p className="whitespace-pre-wrap">{detail.prompt}</p>
                  </>
                )}
              </div>
            )}
          </section>

          {/* 우측: CI 가이드라인 */}
          <section>
            <CiGuideline data={ciForComponent} />
          </section>
        </div>
      </main>
    </div>
  );
}
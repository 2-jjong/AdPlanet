// pages/archive/logo/components/CiGuideline.tsx
import React from "react";
import type { CiGuideline as CiDto } from "../../../services/dto/logo.response";

type Props = { data: CiDto };

// 줄바꿈/빈칸 정리
const toLines = (v?: string): string[] =>
  (v ?? "")
    .split(/\r?\n/)
    .map(s => s.trim())
    .filter(Boolean);

// HEX 보정
const withHash = (hex?: string) => {
  if (!hex) return;
  return hex.startsWith("#") ? hex : `#${hex}`;
};

const Box: React.FC<{ title: string; children?: React.ReactNode }> = ({ title, children }) => (
  <div className="rounded-xl border border-slate-700/80 bg-slate-800/40 p-4">
    <h4 className="text-primary font-semibold mb-2">{title}</h4>
    {children}
  </div>
);

const Bullets: React.FC<{ items?: string[] }> = ({ items }) => (
  <ul className="space-y-1">
    {(items ?? []).map((s, i) => (
      <li key={i} className="text-slate-200 leading-relaxed">• {s}</li>
    ))}
  </ul>
);

// 색상 사각칸
const Swatch: React.FC<{ hex?: string; label?: string }> = ({ hex, label }) => {
  const h = withHash(hex);
  if (!h) return null;
  const disp = h.replace(/^#/, "").toUpperCase();
  return (
    <div className="flex-1">
      <div className="h-16 rounded-md border border-slate-700/80" style={{ background: h }} />
      <div className="mt-2 text-xs tracking-wider opacity-80">{label ?? disp}</div>
    </div>
  );
};

// 가이드 사양 카드(Primary/Secondary)
const GuideSpecCard: React.FC<{ title: string; guide?: CiDto["primaryGuide"] }> = ({ title, guide }) => {
  if (!guide) return null;
  const hex = withHash(guide.hex);
  return (
    <div className="rounded-xl border border-slate-700/80 bg-slate-800/40 p-4 h-full">
      <h5 className="font-semibold mb-2">{title}</h5>
      <div className="text-sm space-y-1">
        {hex && (<div><span className="opacity-80">Hex</span><br/>• {hex}</div>)}
        {guide.rgb && (<div><span className="opacity-80">RGB</span><br/>• ({guide.rgb})</div>)}
        {guide.CMYK && (<div><span className="opacity-80">CMYK</span><br/>• {guide.CMYK}</div>)}
        {guide.mainUsage && (
          <div className="mt-2">
            <span className="opacity-80">주 사용처</span><br/>• {guide.mainUsage}
          </div>
        )}
      </div>
    </div>
  );
};

export default function CiGuideline({ data }: Props) {
  // 왼쪽 규정
  const basic = toLines(data.basicLogo);
  const margin = toLines(data.marginRule);
  const bg     = toLines(data.backgroundRule);
  const ban    = toLines(data.prohibitionRule);

  // 오른쪽 색상
  const pHex = withHash(data.primaryColor);
  const sHex = withHash(data.secondaryColor);
  const nHex = withHash(data.neutralColor);

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* 좌측: 로고 규정 */}
      <div className="col-span-12 xl:col-span-7">
        <div className="rounded-2xl border border-slate-700/80 bg-slate-900/40 p-4 md:p-5">
          <h3 className="text-xl font-bold mb-4">로고 규정</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Box title="기본 로고">
              <Bullets items={basic} />
            </Box>

            <Box title="여백 규정">
              <Bullets items={margin} />
            </Box>

            <Box title="최소 사이즈">
              <Bullets items={data.minSize} />
            </Box>

            <Box title="배경 규정">
              <Bullets items={bg} />
            </Box>

            {!!ban.length && (
              <Box title="금지 규정">
                <Bullets items={ban} />
              </Box>
            )}
          </div>
        </div>
      </div>

      {/* 우측: 색상 규정 */}
      <div className="col-span-12 xl:col-span-5">
        <div className="rounded-2xl border border-slate-700/80 bg-slate-900/40 p-4 md:p-5 h-full">
          <h3 className="text-xl font-bold mb-4">색상 규정</h3>

          {/* 상단 스와치 */}
          <div className="flex items-center gap-4 mb-5">
            <Swatch hex={pHex} />
            <Swatch hex={sHex} />
            <Swatch hex={nHex} />
          </div>

          {/* 스펙/팔레트 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <GuideSpecCard title="Primary"   guide={data.primaryGuide} />
            <GuideSpecCard title="Secondary" guide={data.secondaryGuide} />
            {data.neutralGuide && data.neutralGuide.length > 0 && (
              <div className="rounded-xl border border-slate-700/80 bg-slate-800/40 p-4 h-full">
                <h5 className="font-semibold mb-2">Neutral</h5>
                <ul className="text-sm space-y-1">
                  {data.neutralGuide.map((g, i) => (
                    <li key={`${g.name}-${i}`} className="flex items-center gap-2">
                      <span
                        className="inline-block h-4 w-4 rounded border border-slate-700/80"
                        style={{ background: withHash(g.value) }}
                      />
                      <span className="opacity-80">{g.name}</span>
                      <span className="ml-1">{withHash(g.value)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

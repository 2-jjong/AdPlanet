import React from "react";

/** LogoDetailPage에서 어댑트해서 넘겨주는 타입과 맞춤 */
export type ColorSpec = { name: string; hex: string; rgb?: string; cmyk?: string; note?: string };
export type CiGuidelineData = {
  basicRules: string[];
  minSize: { widthMm: number; dpiPx: number };
  marginRules: string[];
  backgroundRules: string[];
  palette: { primary: ColorSpec[]; secondary: ColorSpec[]; neutral: ColorSpec[] };
};

type Props = { data: CiGuidelineData };

const Box: React.FC<{ title: string; children?: React.ReactNode }> = ({ title, children }) => (
  <div className="rounded-xl border border-slate-700/80 bg-slate-800/40 p-4">
    <h4 className="text-[#87DEDA] font-semibold mb-2">{title}</h4>
    {children}
  </div>
);

const Bullets: React.FC<{ items?: string[] }> = ({ items }) => (
  <ul className="space-y-1">
    {(items ?? []).map((s, i) => (
      <li key={i} className="text-slate-200 leading-relaxed">
        • {s}
      </li>
    ))}
  </ul>
);

const Swatch: React.FC<{ hex: string; label?: string }> = ({ hex, label }) => (
  <div className="flex-1">
    <div className="h-16 rounded-md border border-slate-700/80" style={{ background: hex }} />
    <div className="mt-2 text-xs tracking-wider opacity-80">{label ?? hex.replace(/^#/, "").toUpperCase()}</div>
  </div>
);

function hexToRgb(hex?: string): string | undefined {
  if (!hex) return;
  const m = hex.replace("#", "");
  if (m.length !== 6) return;
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

const ColorSpecCard: React.FC<{ title: string; color?: ColorSpec }> = ({ title, color }) => {
  if (!color) return null;
  const rgb = color.rgb ?? hexToRgb(color.hex);
  return (
    <div className="rounded-xl border border-slate-700/80 bg-slate-800/40 p-4 h-full">
      <h5 className="font-semibold mb-2">{title}</h5>
      <div className="text-sm space-y-1">
        <div><span className="opacity-80">Hex</span><br/>• {color.hex}</div>
        {rgb && <div><span className="opacity-80">RGB</span><br/>• ({rgb})</div>}
        {color.cmyk && <div><span className="opacity-80">CMYK</span><br/>• {color.cmyk}</div>}
        {color.note && <div className="mt-2"><span className="opacity-80">주 사용처</span><br/>• {color.note}</div>}
      </div>
    </div>
  );
};

/** 피그마 캡처 레이아웃을 한 컴포넌트에서 완성 */
export default function CiGuideline({ data }: Props) {
  const p = data.palette.primary?.[0];
  const s = data.palette.secondary?.[0];
  const n = data.palette.neutral?.[0];

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* 좌측: 로고 규정 */}
      <div className="col-span-12 xl:col-span-7">
        <div className="rounded-2xl border border-slate-700/80 bg-slate-900/40 p-4 md:p-5">
          <h3 className="text-xl font-bold mb-4">로고 규정</h3>

          {/* 2열 카드 배열 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 왼쪽 세트 */}
            <Box title="기본 로고">
              <Bullets items={data.basicRules} />
            </Box>

            <Box title="여백 규정">
              <Bullets items={data.marginRules} />
            </Box>

            <Box title="최소 사이즈">
              <ul className="space-y-1">
                <li>• 인쇄용: 가로 {Math.max(0, data.minSize.widthMm)}mm 이상</li>
                <li>• 디지털용: 가로 {Math.max(0, data.minSize.dpiPx)}px 이상</li>
              </ul>
            </Box>

            <Box title="배경 규정">
              <Bullets items={data.backgroundRules} />
            </Box>
          </div>
        </div>
      </div>

      {/* 우측: 색상 규정 */}
      <div className="col-span-12 xl:col-span-5">
        <div className="rounded-2xl border border-slate-700/80 bg-slate-900/40 p-4 md:p-5 h-full">
          <h3 className="text-xl font-bold mb-4">색상 규정</h3>

          {/* 스와치 줄 */}
          <div className="flex items-center gap-4 mb-5">
            {p && <Swatch hex={p.hex} label={p.hex.replace("#", "").toUpperCase()} />}
            {s && <Swatch hex={s.hex} label={s.hex.replace("#", "").toUpperCase()} />}
            {n && <Swatch hex={n.hex} label={n.hex.replace("#", "").toUpperCase()} />}
          </div>

          {/* 3컬럼 스펙 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ColorSpecCard title="Primary"   color={p} />
            <ColorSpecCard title="Secondary" color={s} />
            <ColorSpecCard title="Neutral"   color={n} />
          </div>
        </div>
      </div>
    </div>
  );
}

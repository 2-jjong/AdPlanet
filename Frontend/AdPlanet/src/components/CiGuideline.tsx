// LogoDetailPage.tsx에서 CiGuideline 컴포넌트를 불러올 때, props로 data를 전달하도록
export type ColorSpec = {
  name: string;
  hex: string;
  rgb?: string;
  cmyk?: string;
  note?: string;
};

export type CiGuidelineData = {
  basicRules: string[];
  minSize: { widthMm: number; dpiPx: number };
  marginRules: string[];
  backgroundRules: string[];
  palette: {
    primary: ColorSpec[];
    secondary: ColorSpec[];
    neutral: ColorSpec[];
  };
};

// ✅ 기본 더미 데이터 (필요시 여기만 바꿔서 빠르게 프토토타입 가능)
const DEFAULT_CI: CiGuidelineData = {
  basicRules: [
    "기본 로고는 워드마크와 심볼을 함께 사용합니다.",
    "축소/확대 시 가독성 유지에 유의합니다."
  ],
  minSize: { widthMm: 20, dpiPx: 80 },
  marginRules: ["로고 주변에는 로고 높이의 1/2 이상 여백을 확보합니다."],
  backgroundRules: [
    "밝은 배경 또는 중립 컬러 배경에서 사용을 권장합니다.",
    "사진/컬러 배경 위에서는 흰 단색 로고 사용을 권장합니다."
  ],
  palette: {
    primary: [{ name: "Primary Green", hex: "#30BF86", rgb: "48,191,134" }],
    secondary: [{ name: "Secondary Blue", hex: "#3A84C8", rgb: "58,132,200" }],
    neutral: [
      { name: "Black", hex: "#000000" },
      { name: "White", hex: "#FFFFFF" },
      { name: "Gray", hex: "#CCCCCC" }
    ]
  }
};

type CiGuidelineProps = {
  data?: CiGuidelineData;     // 없으면 DEFAULT_CI 사용
  title?: string;              // 섹션 제목 커스텀
  className?: string;          // 외부에서 래퍼 스타일 추가
};

function RuleList({ title, items }: { title: string; items?: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="rounded-xl bg-slate-950/40 p-4 border border-slate-800">
      <h3 className="font-semibold mb-2">{title}</h3>
      <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
        {items.map((r, i) => (
          <li key={`${title}-${i}`}>{r}</li>
        ))}
      </ul>
    </div>
  );
}

function Swatch({ c }: { c: ColorSpec }) {
  const onCopy = async (text: string) => {
    try {
      await navigator.clipboard?.writeText(text);
      // Optional: 토스트 시스템 있다면 여기서 호출
    } catch {
      // fallback: 아무것도 안 함
    }
  };

  return (
    <div className="flex gap-3 items-center p-3 rounded-xl bg-slate-900/50 border border-slate-800">
      <div
        className="w-10 h-10 rounded-md border border-slate-700 shrink-0"
        style={{ background: c.hex }}
        title={c.hex}
      />
      <div className="text-sm min-w-0 flex-1">
        <div className="font-medium truncate">{c.name}</div>
        <div className="text-slate-400 truncate">
          Hex {c.hex}
          {c.rgb ? ` · RGB ${c.rgb}` : ""}
          {c.cmyk ? ` · CMYK ${c.cmyk}` : ""}
        </div>
        {c.note && <div className="text-slate-500">{c.note}</div>}
      </div>
      <button
        type="button"
        onClick={() => onCopy(c.hex)}
        className="text-xs px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700"
        aria-label={`${c.name} 색상 코드 복사`}
        title="Hex 복사"
      >
        Copy
      </button>
    </div>
  );
}

function PaletteColumn({
  label,
  colors
}: {
  label: string;
  colors?: ColorSpec[];
}) {
  if (!colors || colors.length === 0) return null;
  return (
    <div>
      <div className="text-sm text-slate-400 mb-2">{label}</div>
      <div className="space-y-2">
        {colors.map((c, i) => (
          <Swatch key={`${label}-${i}-${c.hex}`} c={c} />
        ))}
      </div>
    </div>
  );
}

export default function CiGuideline({
  data,
  title = "CI 가이드라인",
  className = ""
}: CiGuidelineProps) {
  const d = data ?? DEFAULT_CI;

  return (
    <section
      className={
        "rounded-2xl bg-slate-900/60 border border-slate-800 p-5 " + className
      }
    >
      <h2 className="text-lg font-semibold mb-4">{title}</h2>

      {/* 규정 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <RuleList title="기본 로고" items={d.basicRules} />

        {/* 최소 사이즈 */}
        <div className="rounded-xl bg-slate-950/40 p-4 border border-slate-800">
          <h3 className="font-semibold mb-2">최소 사이즈</h3>
          <p className="text-sm text-slate-300">
            인쇄물: 최소 {d.minSize?.widthMm ?? "-"}mm
          </p>
          <p className="text-sm text-slate-300">
            디지털: 최소 {d.minSize?.dpiPx ?? "-"}px
          </p>
        </div>

        <RuleList title="여백 규정" items={d.marginRules} />
        <RuleList title="배경 규정" items={d.backgroundRules} />
      </div>

      {/* 색상 규정 */}
      <div className="space-y-4">
        <h3 className="font-semibold">색상 규정</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PaletteColumn label="Primary" colors={d.palette?.primary} />
          <PaletteColumn label="Secondary" colors={d.palette?.secondary} />
          <PaletteColumn label="Neutral" colors={d.palette?.neutral} />
        </div>
      </div>
    </section>
  );
}
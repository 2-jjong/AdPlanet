import { useParams, Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import LogoCard from "../components/LogoCard";
import CiGuideline from "../components/CiGuideline";

type ColorSpec = { name: string; hex: string; rgb?: string; cmyk?: string; note?: string; };
type CiGuidelineData = {
  basicRules: string[];
  minSize: { widthMm: number; dpiPx: number };
  marginRules: string[];
  backgroundRules: string[];
  palette: { primary: ColorSpec[]; secondary: ColorSpec[]; neutral: ColorSpec[]; };
};
type LogoAsset = {
  id: string; name: string; imageUrl: string;
  slogan?: string; prompt?: string; ci: CiGuidelineData;
};

// 더미 정의 ------------------------------------------------------------
const LOGO_DB: Record<string, LogoAsset> = {
  "logo-001": {
    id: "logo-001",
    name: "싸피컴퍼니",
    imageUrl: "/images/sample-logo.png",
    slogan: "포기는 배추 셀 때나 하는 말",
    prompt: "아삭아삭한 배추 이미지, 싱싱한 초록색 활용",
    ci: {
      basicRules: [
        "기본 로고는 워드마크와 심볼을 함께 사용한다.",
        "축소 시 가독성 유지에 유의한다."
      ],
      minSize: { widthMm: 20, dpiPx: 80 },
      marginRules: ["로고 주변 높이의 1/2 이상 여백 확보."],
      backgroundRules: ["밝은 배경 권장.", "사진 위엔 흰 단색 로고 사용."],
      palette: {
        primary: [{ name: "30BF86", hex: "#30BF86", rgb: "48,191,134" }],
        secondary: [{ name: "3A84C8", hex: "#3A84C8", rgb: "58,132,200" }],
        neutral: [
          { name: "Black", hex: "#000000" },
          { name: "White", hex: "#FFFFFF" },
          { name: "Gray", hex: "#CCCCCC" }
        ]
      }
    }
  }
};

//---------------------------------------------------------------------

export default function LogoDetailPage() {
  const { id } = useParams();
  const asset = (id && LOGO_DB[id]) || Object.values(LOGO_DB)[0]; // 간단 폴백

  return (
    <div className="min-h-screen bg-[#12141f] text-slate-200">
      <Navigation />
      <main className="px-6 pt-6 pb-24 max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">{asset.name}의 로고</h1>
          <Link to="/archive/logo" className="rounded-xl px-3 py-2 bg-slate-800 hover:bg-slate-700">뒤로</Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="space-y-6">
            <LogoCard imageUrl={asset.imageUrl} title={asset.name} />
            {(asset.slogan || asset.prompt) && (
              <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5">
                {asset.slogan && (<><h2 className="text-lg font-semibold mb-2">슬로건</h2><p>{asset.slogan}</p><div className="my-4 h-px bg-slate-800" /></>)}
                {asset.prompt && (<><h2 className="text-lg font-semibold mb-2">프롬프트</h2><p className="whitespace-pre-wrap">{asset.prompt}</p></>)}
              </div>
            )}
          </section>

          <section>
            <CiGuideline data={asset.ci} />
          </section>
        </div>
      </main>
    </div>
  );
}

import React, { useState } from "react";
import LogoClean from "../../../assets/images/clean.png";
import LogoPunk from "../../../assets/images/punk.png";
import LogoCartoon from "../../../assets/images/cartoon.png";
import LogoMono from "../../../assets/images/mono.png";
import LogoSaveModal from "../components/LogoSaveModal";
import { useNavigate } from "react-router-dom";
import DownloadModal from "../components/DownloadModal";
import { Button } from "../../../components/UI/Button/Button";
import Header from "../../../components/Layout/Header";
import { LogoStyle } from "../../../services/dto/logo.request";
import { useCreateLogo } from "../hooks/mutation/useCreateLogo";
import { useLogoDownload } from "../hooks/mutation/useLogoDownload";
import AdPlanetLoaderOverlay from "../components/AdPlanetLoaderOverlay";
import GenerateButton from "../components/GenerateButton";
import TiltCard from "../components/TiltCard";
import StylePreviewOverlay from "../components/StylePreviewOverlay";
import Loading from "../../../components/UI/Loading/Loading";

const recommends: { src: string; label: string; value: LogoStyle }[] = [
  { src: LogoClean, label: "Simple", value: LogoStyle.SIMPLE },
  { src: LogoPunk, label: "Punk", value: LogoStyle.PUNK },
  { src: LogoCartoon, label: "Cartoon", value: LogoStyle.CARTOON },
  { src: LogoMono, label: "Mono", value: LogoStyle.MONO },
];

const LogoPage: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState<LogoStyle>(LogoStyle.SIMPLE);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const { mutate: generateLogo, data, isPending, error } = useCreateLogo();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [logoId, setLogoId] = useState<number | null>(null);
  const [showLoader, setShowLoader] = useState(false);
  const [styleInfoOpen, setStyleInfoOpen] = useState(false);
  const [styleInfo, setStyleInfo] = useState<{
    imageSrc: string;
    title: string;
    description: string;
    tips: string[];
    origin: { left: number; top: number; width: number; height: number } | null;
  }>({
    imageSrc: "",
    title: "",
    description: "",
    tips: [],
    origin: null,
  });

  const styleMeta = {
    [LogoStyle.SIMPLE]: {
      title: "Simple / Minimal",
      description:
        "불필요한 요소를 덜어낸 간결한 형태. 다양한 매체에서 명확하게 읽히고, 장기 사용에 유리합니다.",
      tips: [
        "명확한 형태와 대비를 유지하세요.",
        "단색 또는 2-색 조합을 추천합니다.",
        "아이콘과 텍스트의 비율을 간단히.",
      ],
    },
    [LogoStyle.PUNK]: {
      title: "Punk",
      description:
        "강렬한 컬러와 거친 질감, 파격적인 구성이 특징. 공격적인 개성이나 실험적인 브랜드에 적합합니다.",
      tips: [
        "고대비 네온 컬러 조합을 활용하세요.",
        "난형/비대칭 레이아웃, 왜곡된 타이포 시도.",
        "텍스처(그런지/노이즈)로 빈티지 무드 강화.",
      ],
    },
    [LogoStyle.CARTOON]: {
      title: "Cartoon",
      description:
        "친근하고 발랄한 톤의 일러스트/도형 기반. 캐릭터성, 유머 코드를 녹인 브랜드에 어울립니다.",
      tips: [
        "둥근 코너와 두툼한 라인으로 가독성 확보.",
        "선명한 원색 위주의 팔레트 추천.",
        "과한 디테일보다는 형태의 명확함에 집중.",
      ],
    },
    [LogoStyle.MONO]: {
      title: "Monochrome",
      description:
        "흑백 중심의 모던한 톤. 인쇄/각인 등 현실 매체에 강하며, 세련된 이미지를 전달합니다.",
      tips: [
        "선 굵기와 여백을 넉넉히.",
        "그라디언트 대신 명암 대비 활용.",
        "어두운 배경/밝은 배경 버전을 함께 고려.",
      ],
    },
  } as const;
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const { mutate: downloadLogo } = useLogoDownload();

  const handleGenerate = async () => {
    if (!title) {
      alert("회사명을 입력해주세요.");
      return;
    }
    if (!prompt) {
      alert("프롬프트를 입력해주세요.");
      return;
    }
    setShowLoader(true);
    setImageUrl(null);
    setLogoId(null);
    generateLogo(
      {
        title,
        content,
        prompt,
        style,
      },
      {
        onSuccess: (res) => {
          if (res?.code == "S0000") {
            console.log("로고 생성 성공", res);
            setImageUrl(res.data.imgUrl ?? null);
            setLogoId(res.data.logoId ?? null);
            setShowLoader(false);
            setIsSaveModalOpen(true);
          } else {
            console.log("로고 생성 실패");
            alert("로고 생성 중 오류가 발생했습니다.");
            setShowLoader(false);
          }
        },
        onError: (err) => {
          console.error("로고 생성 실패:", err);
          alert("로고 생성 중 오류가 발생했습니다.");
          setShowLoader(false);
        },
      }
    );
  };

  const handleDownload = (ext: string) => {
    if (!logoId) {
      alert("로고 ID가 없습니다.");
      return;
    }

    downloadLogo(
      { logoId: logoId, format: ext },
      {
        onSuccess: (res) => {
          const blob = new Blob([res.data], {
            type: res.headers["content-type"],
          });

          let filename = "download.png";
          const disposition = res.headers["content-disposition"];
          if (disposition) {
            const match = disposition.match(
              /filename\*?=(?:UTF-8'')?"?([^\";]+)"?/
            );
            if (match?.[1]) filename = decodeURIComponent(match[1]);
          }
          filename = filename.replace(/_+$/, "");

          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
        },
        onError: (err) => {
          console.error("다운로드 에러:", err);
          alert("다운로드 중 오류가 발생했습니다.");
        },
      }
    );
  };

  return (
    <div className="flex flex-row w-full h-screen overflow-hidden">
      <div className="flex-1 flex flex-col md:p-6 overflow-hidden">
        {/* Header */}
        <header className="flex items-start justify-between flex-shrink-0">
          <Header />
          <div className="flex items-center gap-2 md:gap-3 flex-nowrap">
            <Button
              text="다운로드"
              variant={data?.data.imgUrl ? "fill" : "outline"}
              size="xs"
              onClick={() => setIsDownloadModalOpen(true)}
            />
            <Button
              text="Archive 바로가기"
              variant="outline"
              size="xs"
              onClick={() => navigate("/archive")}
            />
          </div>
        </header>

        {/* 로고 추천, 캔버스 영역 - 남은 공간을 모두 차지 */}
        <section className="mt-4 grid grid-cols-1 md:grid-cols-[160px,1fr] gap-5 flex-1 min-h-0">
          {/* 로고 추천 영역 - 전체 높이 사용 */}
          <aside className="w-full rounded-xl p-3 md:p-4 flex flex-col items-center bg-white/5 border border-white/10 backdrop-blur h-full">
            <h2 className="text-lg font-jamsil text-text-color text-center flex-shrink-0 p-3">
              Style
            </h2>

            <div className="flex flex-col w-full gap-4 mt-5">
              {recommends.map((item, idx) => (
                <TiltCard
                  key={idx}
                  className={`relative w-full flex-1 rounded-2xl transition-all duration-200 `}
                  onClick={(e) => {
                    setSelectedIdx(idx);
                    setStyle(item.value);
                    const meta =
                      styleMeta[item.value] ??
                      ({
                        title: item.label,
                        description: "",
                        tips: [],
                      } as unknown);
                    const r =
                      (
                        e.currentTarget.querySelector("img") as HTMLImageElement
                      )?.getBoundingClientRect?.() ||
                      (
                        e.currentTarget as HTMLDivElement
                      ).getBoundingClientRect();
                    setStyleInfo({
                      imageSrc: item.src,
                      title: meta.title,
                      description: meta.description,
                      tips: [...(meta.tips ?? [])],
                      origin: r
                        ? {
                            left: r.left,
                            top: r.top,
                            width: r.width,
                            height: r.height,
                          }
                        : null,
                    });
                    setStyleInfoOpen(true);
                  }}
                >
                  <img
                    src={item.src}
                    alt={item.label}
                    className={`w-full h-auto object-contain
                    ${
                      selectedIdx === idx
                        ? "ring-[4px] ring-primary rounded-[40px]"
                        : "hover:ring-white/20"
                    }`}
                    loading="lazy"
                  />
                </TiltCard>
              ))}
            </div>
          </aside>

          {/* Canvas - 전체 높이 사용 */}
          <main className="relative overflow-hidden h-full">
            <div className="h-full w-full flex items-center justify-center rounded-2xl overflow-hidden relative bg-white/5 border border-white/10">
              {error && <p className="text-red-500 text-sm">{error.message}</p>}

              {/* 로딩 상태 */}
              {(isPending || showLoader) && <Loading />}

              {/* 로고 이미지 */}
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Generated Logo"
                  className="max-h-full max-w-full rounded-xl"
                />
              )}

              {/* 초기 안내 메시지 - 로고가 없고 로딩 중이 아닐 때만 표시 */}
              {!imageUrl && !isPending && !showLoader && (
                <div className="text-center text-text-color/60 transition-colors max-w-md mx-auto px-6">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl flex items-center justify-center transition-transform duration-300">
                    <svg
                      className="w-10 h-10 text-primary/60"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">
                    로고를 만들어보세요
                  </h3>
                  <p className="text-sm text-text-color/70 leading-relaxed mb-2">
                    브랜드명과 원하는 스타일을 입력하고 설명을 작성하여
                  </p>
                  <p className="text-sm text-text-color/70 leading-relaxed mb-4">
                    생성 버튼을 눌러주세요
                  </p>
                  <div className="text-xs text-primary/80 bg-primary/10 rounded-lg px-3 py-2 border border-primary/20">
                    AI가 몇 초 만에 전문적인 로고를 디자인해드립니다
                  </div>
                </div>
              )}
            </div>
          </main>
        </section>
      </div>

      {/* 오른쪽 프롬프트 영역 */}
      <aside className="w-[320px] md:w-[360px] bg-[#12131F] border-l border-white/10 p-4 flex flex-col gap-5 overflow-auto">
        {/* 기본 정보 */}
        <section className="flex flex-col gap-3 mt-6">
          <h3 className="text-lg font-semibold border-b border-white/20 pb-1">
            기본 정보
          </h3>
          <input
            type="text"
            placeholder="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md bg-transparent border border-primary px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="내용"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full rounded-md bg-transparent border border-primary px-3 py-2 text-sm"
          />
        </section>

        {/* 로고 설명 */}
        <section className="flex flex-col gap-3 flex-1">
          <h3 className="text-lg font-semibold border-b border-white/20 pb-1">
            로고 설명
          </h3>
          <textarea
            placeholder="원하는 로고의 모양, 스타일, 분위기를 자세히 설명해주세요."
            className="w-full h-40 resize-none rounded-md bg-transparent border border-primary px-3 py-2 text-sm"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            maxLength={199}
          />
          <div className="flex justify-end text-xs opacity-70">
            <span>{prompt.length} / 200</span>
          </div>
        </section>

        {/* 버튼 */}
        <GenerateButton
          onClick={handleGenerate}
          disabled={isPending}
          loading={isPending}
        >
          {isPending ? "생성 중..." : "로고 생성하기"}
        </GenerateButton>
      </aside>

      {logoId && (
        <LogoSaveModal
          isOpen={isSaveModalOpen}
          logoId={logoId}
          onClose={() => setIsSaveModalOpen(false)}
          onSave={(category) => console.log("저장된 카테고리:", category)}
        />
      )}
      <StylePreviewOverlay
        open={styleInfoOpen}
        onClose={() => setStyleInfoOpen(false)}
        onConfirm={() => setStyleInfoOpen(false)}
        imageSrc={styleInfo.imageSrc}
        title={styleInfo.title}
        description={styleInfo.description}
        tips={styleInfo.tips}
        origin={styleInfo.origin}
      />
      <DownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        imageUrl={imageUrl ?? ""}
        onDownload={handleDownload}
      />
    </div>
  );
};

export default LogoPage;

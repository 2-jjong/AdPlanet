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
import { useCreateLogo } from "../hooks/useCreateLogo";
import { useLogoDownload } from "../hooks/useLogoDownload";

const recommends: { src: string; label: string; value: LogoStyle }[] = [
  { src: LogoClean, label: "깔끔한", value: LogoStyle.SIMPLE },
  { src: LogoPunk, label: "핑크", value: LogoStyle.SIMPLE },
  { src: LogoCartoon, label: "만화같은", value: LogoStyle.SIMPLE },
  { src: LogoMono, label: "흑백", value: LogoStyle.MONO },
];

const LogoPage: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState<LogoStyle>(LogoStyle.SIMPLE);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const { mutate: generateLogo, data, isPending, error } = useCreateLogo();
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
            setTimeout(() => {
              setIsSaveModalOpen(true);
            }, 7000);
          } else {
            console.log("로고 생성 실패");
            alert("로고 생성 중 오류가 발생했습니다.");
          }
        },
        onError: (err) => {
          console.error("로고 생성 실패:", err);
          alert("로고 생성 중 오류가 발생했습니다.");
        },
      }
    );
  };

  const handleDownload = (ext: string) => {
    if (!data?.data.logoId) {
      alert("로고 ID가 없습니다.");
      return;
    }

    downloadLogo(
      { logoId: data.data.logoId, format: ext },
      {
        onSuccess: (res) => {
          if (res?.code === "S0000") {
            const url = res.data; // 서버에서 응답한 이미지 URL
            const link = document.createElement("a");
            link.href = url;
            link.download = `logo.${ext}`;
            link.click();
          } else {
            alert("다운로드 실패");
          }
        },
        onError: (err) => {
          console.error("다운로드 에러:", err);
          alert("다운로드 중 오류가 발생했습니다.");
        },
      }
    );
  };

  return (
    <div className='flex flex-row w-full min-h-screen'>
      <div className='flex-1 flex flex-col md:p-6'>
        {/* Header */}
        <header className='flex items-start justify-between'>
          {/* <h1 className='text-4xl md:text-5xl font-bold text-primary'>AdPlanet</h1> */}
          <Header />
          <div className='flex items-center gap-2 md:gap-3 flex-nowrap'>
            <Button
              text='다운로드'
              variant={data?.data.imgUrl ? "fill" : "outline"}
              size='xs'
              onClick={() => setIsDownloadModalOpen(true)}
            />
            <Button
              text='Archive 바로가기'
              variant='outline'
              size='xs'
              onClick={() => navigate("/archive")}
            />
          </div>
        </header>

        {/* 로고 추천, 캔버스 영역 */}
        <section className='mt-6 grid grid-cols-1 md:grid-cols-[160px,1fr] gap-6'>
          {/* 로고 추천 영역 */}
          <aside className='w-full border-2 border-dotted border-primary rounded-xl p-3 md:p-4 flex flex-col items-center'>
            <h2 className='text-lg font-jamsil text-text-color text-center'>Recommend</h2>

            <div className='mt-3 grid grid-cols-2 md:grid-cols-1 gap-4 w-full'>
              {recommends.map((item, idx) => (
                <div
                  key={idx}
                  className={`w-full cursor-pointer rounded-[50px] overflow-hidden ${
                    selectedIdx === idx
                      ? "border-[5px] border-primary"
                      : "border border-transparent"
                  }`}
                  onClick={() => {
                    setSelectedIdx(idx);
                    setStyle(item.value);
                  }}
                >
                  <img
                    src={item.src}
                    alt={item.label}
                    className='w-full aspect-square h-auto rounded-2xl object-contain ring-1 ring-white/10'
                    loading='lazy'
                  />
                </div>
              ))}
            </div>
          </aside>

          {/* Canvas */}
          <main className='relative'>
            <div className='h-[360px] md:h-[520px] lg:h-[560px] w-full flex items-center justify-center rounded-2xl border-2 border-dotted border-primary'>
              {isPending && <p className='opacity-70'>로고 생성 중...</p>}
              {error && <p className='text-red-500 text-sm'>{error.message}</p>}
              {data ? (
                <img
                  src={data.data.imgUrl}
                  alt='Generated Logo'
                  className='max-h-full max-w-full rounded-xl'
                />
              ) : (
                !isPending && <p className='opacity-70'>로고가 여기에 표시됩니다.</p>
              )}
            </div>
          </main>
        </section>
      </div>

      {/* 오른쪽 프롬프트 영역 */}
      <aside className='w-[320px] md:w-[360px] bg-[#12131F] border-l border-white/10 p-4 flex flex-col gap-6'>
        {/* 기본 정보 */}
        <section className='flex flex-col gap-3 mt-10'>
          <h3 className='text-lg font-semibold border-b border-white/20 pb-1'>기본 정보</h3>
          <input
            type='text'
            placeholder='회사/브랜드 명'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className='w-full rounded-md bg-transparent border border-primary px-3 py-2 text-sm'
          />
          <input
            type='text'
            placeholder='슬로건 (선택사항)'
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className='w-full rounded-md bg-transparent border border-primary px-3 py-2 text-sm'
          />
        </section>

        {/* 로고 설명 */}
        <section className='flex flex-col gap-3 flex-1'>
          <h3 className='text-lg font-semibold border-b border-white/20 pb-1'>로고 설명</h3>
          <textarea
            placeholder='원하는 로고의 모양, 스타일, 분위기를 자세히 설명해주세요.'
            className='w-full h-40 resize-none rounded-md bg-transparent border border-primary px-3 py-2 text-sm'
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            maxLength={199}
          />
          <div className='flex justify-end text-xs opacity-70'>
            <span>{prompt.length} / 200</span>
          </div>
        </section>

        {/* 버튼 */}
        <Button
          text={isPending ? "생성 중..." : "로고 생성하기"}
          variant='fill'
          onClick={handleGenerate}
          disabled={isPending}
        />
      </aside>

      {data?.data.logoId && (
        <LogoSaveModal
          isOpen={isSaveModalOpen}
          logoId={data.data.logoId}
          onClose={() => setIsSaveModalOpen(false)}
          onSave={(category) => console.log("저장된 카테고리:", category)}
        />
      )}
      <DownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        imageUrl={data?.data.imgUrl ?? ""}
        onDownload={handleDownload}
      />
    </div>
  );
};

export default LogoPage;

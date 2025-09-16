import React from "react";
import { Button } from "../components/Button";
import LogoClean from "../assets/clean.png";
import LogoPunk from "../assets/punk.png";
import LogoCartoon from "../assets/cartoon.png";
import LogoMono from "../assets/mono.png";
const recommends = [
  { src: LogoClean, label: "깔끔한" },
  { src: LogoPunk, label: "핑크" },
  { src: LogoCartoon, label: "만화같은" },
  { src: LogoMono, label: "흑백" },
];

const LogoPage: React.FC = () => {
  return (
    <div className='flex flex-row w-full min-h-screen'>
      <div className='flex-1 flex flex-col md:p-6'>
        {/* Header */}
        <header className='flex items-start justify-between'>
          <h1 className='text-4xl md:text-5xl font-bold text-primary'>AdPlanet</h1>

          <div className='flex items-center gap-2 md:gap-3 flex-nowrap'>
            <Button text='다운로드' variant='outline' size='xs' />
            <Button text='Archive 바로가기' variant='outline' size='xs' />
          </div>
        </header>

        {/* 로고 추천, 캔버스 영역 */}
        <section className='mt-6 grid grid-cols-1 md:grid-cols-[160px,1fr] gap-6'>
          {/* 로고 추천 영역 */}
          <aside className='w-full border-2 border-dotted border-primary rounded-xl p-3 md:p-4 flex flex-col items-center'>
            <h2 className='text-lg font-jamsil text-text-color text-center'>Recommend</h2>

            <div className='mt-3 grid grid-cols-2 md:grid-cols-1 gap-4 w-full'>
              {recommends.map((item, idx) => (
                <div key={idx} className='w-full'>
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
            <div className='h-[360px] md:h-[520px] lg:h-[560px] rounded-2xl border-2 border-dotted border-primary' />
            {/* 하단 안내문 */}
            <p className='text-center text-sm mt-4 opacity-80'>
              로고 설정을 완료하고 생성 버튼을 눌러주세요.
            </p>
          </main>
        </section>
      </div>

      {/* 오른쪽 프롬프트 영역 */}
      <aside className='w-[320px] md:w-[360px] border-l border-white/10 p-4 flex flex-col gap-6'>
        {/* 기본 정보 */}
        <section className='flex flex-col gap-3 mt-10'>
          <h3 className='text-lg font-semibold border-b border-white/20 pb-1'>기본 정보</h3>
          <input
            type='text'
            placeholder='회사/브랜드 명'
            className='w-full rounded-md bg-transparent border border-primary px-3 py-2 text-sm'
          />
          <input
            type='text'
            placeholder='슬로건 (선택사항)'
            className='w-full rounded-md bg-transparent border border-primary px-3 py-2 text-sm'
          />
        </section>

        {/* 로고 설명 */}
        <section className='flex flex-col gap-3 flex-1'>
          <h3 className='text-lg font-semibold border-b border-white/20 pb-1'>로고 설명</h3>
          <textarea
            placeholder='원하는 로고의 모양, 스타일, 분위기를 자세히 설명해주세요.'
            className='w-full h-40 resize-none rounded-md bg-transparent border border-primary px-3 py-2 text-sm'
            maxLength={500}
          />
          <div className='flex justify-end text-xs opacity-70'>
            <span>0 / 500</span>
          </div>
        </section>

        {/* 버튼 */}
        <Button text='로고 생성하기' variant='fill' />
      </aside>
    </div>
  );
};

export default LogoPage;

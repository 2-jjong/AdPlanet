import { RoundButton } from "../../../components/UI/Button/RoundButton";
import type { CiGuideline } from "../../../services/dto/logo.dto";
import astronautSearching from "../../../assets/images/astronaut_searching.png";

type Props = {
  data?: CiGuideline;
  onCreate?: () => void;
  creating?: boolean;
  className?: string;
};

export default function CiGuidelineUnavailable({ onCreate, className, creating }: Props) {
  return (
    <div
      className={[
        "rounded-[28px] border-2 border-dashed border-primary/70 bg-slate-800/40",
        "px-6 sm:px-10 py-10 sm:py-14",
        "min-h-[420px] flex flex-col items-center justify-center text-center",
        className ?? "",
      ].join(" ")}
    >
      <h3 className='text-2xl sm:text-3xl font-extrabold tracking-tight'>
        생성된 가이드라인이 없습니다
      </h3>

      <img
        src={astronautSearching}
        alt='우주인 일러스트'
        className='mt-8 sm:mt-10 w-[180px] sm:w-[220px] opacity-90 select-none pointer-events-none'
        draggable={false}
      />

      <p className='mt-6 text-slate-300/90 leading-relaxed'>
        자동으로 생성되는 CI 가이드라인으로
        <br />
        브랜드 아이덴티티를 간편하게 관리해보세요.
      </p>

      <RoundButton
        text={creating ? "생성 중…" : "생성하기"}
        size='md'
        variant='fill'
        onClick={onCreate}
        className='mt-8'
      />
    </div>
  );
}

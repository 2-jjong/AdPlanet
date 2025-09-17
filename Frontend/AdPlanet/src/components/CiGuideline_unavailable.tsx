import React from "react";
import astronautSearching from "../assets/astronaut_searching.png";
import { RoundButton } from "./RoundButton";

import type { CiGuideline } from "../types/logo";

type Props = {
  data?: CiGuideline;
  onCreate?: () => void;
  className?: string;
};

export default function CiGuidelineUnavailable({ onCreate, className }: Props) {
  return (
    <div
      className={[
        "rounded-[28px] border-2 border-dashed border-[#87DEDA]/70 bg-slate-800/40",
        "px-6 sm:px-10 py-10 sm:py-14",
        "min-h-[420px] flex flex-col items-center justify-center text-center",
        className ?? "",
      ].join(" ")}
    >
      <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
        생성된 가이드라인이 없습니다
      </h3>

      <img
        src={astronautSearching}
        alt="우주인 일러스트"
        className="mt-8 sm:mt-10 w-[180px] sm:w-[220px] opacity-90 select-none pointer-events-none"
        draggable={false}
      />

      <p className="mt-6 text-slate-300/90 leading-relaxed">
        자동으로 생성되는 CI 가이드라인으로<br />
        브랜드 아이덴티티를 간편하게 관리해보세요.
      </p>

      <RoundButton
        text="생성하기"
        size="md"
        variant="primary"
        onClick={onCreate}          // ← 여기서 부모의 navigate 핸들러 실행
        className="mt-8"
      />
    </div>
  );
}

// src/pages/archive/components/FlipCard.tsx
import type { ReactNode } from "react"; // 타입 전용 임포트 (verbatimModuleSyntax 대응)

type Props = {
  width: number;
  height: number;
  front: ReactNode; // 앞면: 기존 LogoCard
  back: ReactNode;  // 뒷면: 상세(슬로건/프롬프트)
};

export default function FlipCard({ width, height, front, back }: Props) {
  return (
    <div className="group relative" style={{ width, height, perspective: 1000 }}>
      <div
        className="
          relative h-full w-full transition-transform duration-500
          [transform-style:preserve-3d]
          group-hover:[transform:rotateY(180deg)]
        "
      >
        {/* 앞면 */}
        <div className="absolute inset-0 [backface-visibility:hidden]">
          {front}
        </div>

        {/* 뒷면 */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden [transform:rotateY(180deg)] [backface-visibility:hidden]">
          {back}
        </div>
      </div>
    </div>
  );
}

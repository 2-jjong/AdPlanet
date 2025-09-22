// src/modules/Mypage/components/PosterPreviewModal.tsx
import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { RoundButton } from "../../../components/UI/Button/RoundButton";
// 절대 경로(imgUrl) 그대로 사용

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  imageUrl?: string | null;
  slogan?: string | null;   // 그룹 content
  prompt?: string | null;   // 포스터 prompt
  loading?: boolean;
};

const PosterPreviewModal: React.FC<Props> = ({
  open,
  onClose,
  title,
  imageUrl,
  slogan,
  prompt,
  loading,
}) => {
  if (!open) return null;

  // ESC 닫기 & 바디 스크롤 잠금
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const modal = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
    >
      {/* 패널 */}
      <div
        className="relative w-full max-w-5xl mx-4 rounded-xl bg-gray-800 text-white shadow-2xl p-8 border border-primary/30"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full text-xl hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary/60"
          aria-label="닫기"
          title="닫기"
        >
          ✕
        </button>

        {/* 타이틀 (상단 정렬 유지) */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-center">{title ?? "포스터 미리보기"}</h2>
          <p className="text-center text-sm text-white/70 mt-1">
            생성된 포스터의 슬로건과 프롬프트를 확인하세요.
          </p>
        </div>

        {/* 본문: 기존 배치 유지 (좌 이미지 / 우 텍스트) */}
        <div className="grid grid-cols-12 gap-8 items-start">
          {/* Left: Image */}
          <div className="col-span-12 lg:col-span-6 mt-15">
            <div className="rounded-xl bg-gray-700/60 p-4 border border-white/10">
              <div className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-gray-700">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={title ?? "포스터"}
                    className="w-full h-full object-cover"
                  />
                ) : null}
              </div>
            </div>
          </div>

          {/* 우측: Slogan + Prompt */}
          <div className="col-span-12 lg:col-span-6 mt-10">
            {/* 슬로건 */}
            {slogan ? (
              <section className="mb-6">
                <h3 className="text-lg font-extrabold text-primary">슬로건</h3>
                <p className="mt-3 text-base leading-relaxed whitespace-pre-wrap text-white">
                  {slogan}
                </p>
              </section>
            ) : null}

            <hr className="my-6 border-white/10" />

            {/* 프롬프트 */}
            <section>
              <h3 className="text-lg font-extrabold text-primary">프롬프트</h3>
              <p className="mt-3 whitespace-pre-wrap leading-relaxed text-white">
                {loading ? "불러오는 중…" : (prompt ?? "프롬프트가 없습니다.")}
              </p>
            </section>

            {/* Export 버튼 */}
            <div className="mt-6 flex justify-end">
              <RoundButton text="Export" variant="outline" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default PosterPreviewModal;

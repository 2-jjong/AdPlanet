import React from "react";
import SkeletonCanvas, { type SkeletonCanvasHandle } from "./SkeletonCanvas";
import TextEditor from "../../../components/UI/Text/TextEditor";
import type { SkeletonPose, TextOverlay } from "../../../types/poster";

interface PosterSidebarProps {
  step: "upload" | "generate" | "edit" | "text-edit" | "complete" | "mode-select";
  currentPose: SkeletonPose | null;
  isGenerating: boolean;
  textOverlays: TextOverlay[];
  selectedTextId?: string;
  onPoseChange: (pose: SkeletonPose) => void;
  onBackToEdit: () => void;
  onComplete: () => void;
  onSave?: () => void;
  onGenerateCopy?: () => void;
  isGeneratingCopy?: boolean;
  onAddText: (t: TextOverlay) => void;
  onUpdateText: (id: string, u: Partial<TextOverlay>) => void;
  onRemoveText: (id: string) => void;
  onSelectText: (id?: string) => void;
  skeletonRef?: React.Ref<SkeletonCanvasHandle>;
  onModeSelect?: (mode: 'text-edit' | 'upload') => void;
}

const PosterSidebar: React.FC<PosterSidebarProps> = ({
  step,
  currentPose,
  textOverlays,
  selectedTextId,
  onPoseChange,
  onBackToEdit,
  onSave,
  onGenerateCopy,
  isGeneratingCopy,
  onAddText,
  onUpdateText,
  onRemoveText,
  onSelectText,
  skeletonRef,
  onModeSelect,
}) => {
  if (step === "mode-select") {
    return (
      <div className="p-6 flex flex-col gap-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-text-color mb-2">작업 모드 선택</h2>
          <p className="text-sm text-text-color/60">기존 이미지에 문구를 추가하거나 새로운 포스터를 생성하세요</p>
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => onModeSelect?.('text-edit')}
            className="w-full p-6 rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary/15 hover:to-primary/10 hover:border-primary/50 transition-all duration-200 group"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 bg-primary/20 rounded-xl group-hover:bg-primary/30 transition-colors">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-text-color mb-1">광고 문구 추가</h3>
                <p className="text-sm text-text-color/60">기존 이미지에 텍스트를 추가하고 편집합니다</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => onModeSelect?.('upload')}
            className="w-full p-6 rounded-xl border-2 border-white/20 bg-gradient-to-br from-white/5 to-white/2 hover:from-white/10 hover:to-white/5 hover:border-white/30 transition-all duration-200 group"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 bg-white/10 rounded-xl group-hover:bg-white/20 transition-colors">
                <svg className="w-6 h-6 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-text-color mb-1">파일로 포스터 생성</h3>
                <p className="text-sm text-text-color/60">새로운 파일을 업로드해서 포스터를 생성합니다</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  if (step === "text-edit") {
    return (
      <div className="p-4 flex flex-col gap-4">
        <section className="flex flex-col gap-3 flex-1 min-h-0">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10">
            <div className="p-2 bg-primary/10 rounded-lg">
              <svg
                className="w-4 h-4 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <h3 className="text-base font-bold text-text-color">텍스트 편집</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            <TextEditor
              textOverlays={textOverlays}
              onAddText={onAddText}
              onUpdateText={onUpdateText}
              onRemoveText={onRemoveText}
              selectedTextId={selectedTextId}
              onSelectText={onSelectText}
            />
          </div>
        </section>
        <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
          <button
            onClick={onGenerateCopy}
            disabled={!!isGeneratingCopy}
            className={`w-full flex items-center justify-center gap-2 border py-3 rounded-xl font-medium transition-all ${
              isGeneratingCopy
                ? "border-cyan-400/20 text-cyan-200/60 cursor-wait"
                : "border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/10 hover:border-cyan-400/60"
            }`}
          >
            {isGeneratingCopy ? (
              <>
                <div className="w-4 h-4 border-2 border-cyan-300 border-t-transparent rounded-full animate-spin" />
                생성 중...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                문구 생성하기
              </>
            )}
          </button>
          <button
            onClick={onBackToEdit}
            className="w-full flex items-center justify-center gap-2 border border-primary/30 text-primary py-3 rounded-xl font-medium transition-all hover:bg-primary/10 hover:border-primary/50"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            포즈 편집으로 돌아가기
          </button>
          <button
            onClick={onSave}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary/80 text-background py-3 rounded-xl font-medium transition-all hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            저장
          </button>
        </div>
      </div>
    );
  }

  if (step === "edit" && currentPose) {
    return (
      <div className="p-4 flex flex-col gap-4 h-full">
        <section className="flex flex-col gap-3 flex-1 min-h-0">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10 flex-shrink-0">
            <div className="p-2 bg-primary/10 rounded-lg">
              <svg
                className="w-4 h-4 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h3 className="text-base font-bold text-text-color">포즈 조정</h3>
          </div>
          <div className="bg-background/50 rounded-xl border border-white/10 p-3 flex-1 min-h-0 flex items-center justify-center">
            <div className="w-full h-full max-w-md max-h-full">
              <SkeletonCanvas
                ref={skeletonRef}
                pose={currentPose}
                onPoseChange={onPoseChange}
                width={360}
                height={480}
              />
            </div>
          </div>
        </section>
      </div>
    );
  }

  return <div className="p-4" />;
};

export default PosterSidebar;

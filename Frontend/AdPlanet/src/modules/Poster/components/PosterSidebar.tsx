import React from "react";
import SkeletonCanvas, { type SkeletonCanvasHandle } from "./SkeletonCanvas";
import TextEditor from "../../../components/UI/Text/TextEditor";
import type { SkeletonPose, TextOverlay } from "../../../types/poster";

interface PosterSidebarProps {
  step: 'upload' | 'generate' | 'edit' | 'text-edit' | 'complete';
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
}) => {
  if (step === 'text-edit') {
    return (
      <div className='p-4 flex flex-col gap-4'>
        <section className='flex flex-col gap-3 flex-1 min-h-0'>
          <div className='flex items-center gap-3 pb-3 border-b border-white/10'>
            <div className='p-2 bg-primary/10 rounded-lg'>
              <svg className='w-4 h-4 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
              </svg>
            </div>
            <h3 className='text-base font-bold text-text-color'>텍스트 편집</h3>
          </div>
          <div className='flex-1 overflow-y-auto'>
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
        <div className='flex flex-col gap-3 pt-4 border-t border-white/10'>
          <button
            onClick={onGenerateCopy}
            disabled={!!isGeneratingCopy}
            className={`w-full flex items-center justify-center gap-2 border py-3 rounded-xl font-medium transition-all ${
              isGeneratingCopy
                ? 'border-cyan-400/20 text-cyan-200/60 cursor-wait'
                : 'border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/10 hover:border-cyan-400/60'
            }`}
          >
            {isGeneratingCopy ? (
              <>
                <div className='w-4 h-4 border-2 border-cyan-300 border-t-transparent rounded-full animate-spin' />
                생성 중...
              </>
            ) : (
              <>
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6v6m0 0v6m0-6h6m-6 0H6' />
                </svg>
                문구 생성하기
              </>
            )}
          </button>
          <button onClick={onBackToEdit} className='w-full flex items-center justify-center gap-2 border border-primary/30 text-primary py-3 rounded-xl font-medium transition-all hover:bg-primary/10 hover:border-primary/50'>
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
            </svg>
            포즈 편집으로 돌아가기
          </button>
          <button onClick={onSave} className='w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary/80 text-background py-3 rounded-xl font-medium transition-all hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl'>
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
            </svg>
            저장
          </button>
        </div>
      </div>
    );
  }

  if (step === 'edit' && currentPose) {
    return (
      <div className='p-4 flex flex-col gap-4 h-full'>
        <section className='flex flex-col gap-3 flex-1 min-h-0'>
          <div className='flex items-center gap-3 pb-3 border-b border-white/10 flex-shrink-0'>
            <div className='p-2 bg-primary/10 rounded-lg'>
              <svg className='w-4 h-4 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
              </svg>
            </div>
            <h3 className='text-base font-bold text-text-color'>포즈 조정</h3>
          </div>
          <div className='bg-background/50 rounded-xl border border-white/10 p-3 flex-1 min-h-0 flex items-center justify-center'>
            <div className='w-full h-full max-w-md max-h-full'>
              <SkeletonCanvas ref={skeletonRef} pose={currentPose} onPoseChange={onPoseChange} width={360} height={480} />
            </div>
          </div>
        </section>
      </div>
    );
  }

  return <div className='p-4' />;
};

export default PosterSidebar;



import React from "react";

interface PosterCanvasViewProps {
  generatedPoster: string | null;
  onOpenPreview: () => void;
  children?: React.ReactNode;
  isGenerating?: boolean;
  containerRef?: React.Ref<HTMLDivElement>;
}

const PosterCanvasView: React.FC<PosterCanvasViewProps> = ({ generatedPoster, onOpenPreview, children, isGenerating, containerRef }) => {
  const [aspect, setAspect] = React.useState<number>(1);

  React.useEffect(() => {
    if (!generatedPoster) return;
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      if (w > 0 && h > 0) setAspect(w / h);
    };
    img.src = generatedPoster;
  }, [generatedPoster]);
  return (
    <div
      ref={containerRef as any}
      className='relative w-full max-w-[500px] rounded-3xl border-2 border-dashed border-primary/30 hover:border-primary/50 shadow-2xl shadow-primary/5 bg-gradient-to-br from-background to-background/50 backdrop-blur-sm flex items-center justify-center transition-all duration-300 group cursor-pointer'
      style={{ aspectRatio: aspect || 1, maxHeight: '60vh' }}
      onClick={(e) => {
        e.stopPropagation();
        // 텍스트 오버레이 클릭/드래그 중에는 프리뷰를 열지 않음
        const target = e.target as HTMLElement | null;
        if (target && target.closest('[data-overlay="text"]')) return;
        if (generatedPoster) onOpenPreview();
      }}
    >
      {generatedPoster ? (
        <div className='relative w-full h-full'>
          <img src={generatedPoster} alt='Generated Poster' className='w-full h-full object-contain rounded-2xl' />
          {children}
          {isGenerating && (
            <div className='absolute inset-0 bg-black/40 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center gap-3'>
              <div className='w-8 h-8 border-2 border-white/60 border-t-transparent rounded-full animate-spin'></div>
              <div className='text-white text-sm font-medium'>생성중...</div>
            </div>
          )}
        </div>
      ) : (
        <div className='text-center text-text-color/60 group-hover:text-text-color/80 transition-colors'>
          <div className='w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl flex items-center justify-center group-hover:scale-105 transition-transform'>
            <svg className='w-12 h-12 text-primary/60' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' />
            </svg>
          </div>
          <h3 className='text-lg font-semibold mb-2'>포스터 캔버스</h3>
          <p className='text-sm text-text-color/50 max-w-sm mx-auto leading-relaxed'>
            파일을 업로드하고 프롬프트를 입력하여
            <br />
            AI가 생성한 포스터를 확인하세요
          </p>
          {isGenerating && (
            <div className='absolute inset-0 flex flex-col items-center justify-center gap-3'>
              <div className='w-8 h-8 border-2 border-primary/60 border-t-transparent rounded-full animate-spin'></div>
              <div className='text-text-color/80 text-sm font-medium'>생성중...</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PosterCanvasView;



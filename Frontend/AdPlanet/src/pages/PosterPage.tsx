import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import ImageUpload from '../components/ImageUpload';
import PromptInput from '../components/PromptInput';
import SkeletonCanvas from '../components/SkeletonCanvas';
import StyleSelectionDialog from '../components/StyleSelectionDialog';
import Accordion from '../components/Accordion';
import UploadDropzone from '../components/UploadDropzone';
import type { UploadedImage, PosterGenerationState, SkeletonPose } from '../types/poster';
import { PATHS } from '../constants/paths';

const PosterPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [state, setState] = useState<PosterGenerationState>({
    step: 'upload',
    uploadedImages: [],
    generatedPoster: null,
    currentPose: null,
    prompt: '',
    isGenerating: false
  });

  const [personImage, setPersonImage] = useState<UploadedImage | null>(null);
  const [productImage, setProductImage] = useState<UploadedImage | null>(null);
  const [sketchImage, setSketchImage] = useState<UploadedImage | null>(null);
  const [isStyleDialogOpen, setIsStyleDialogOpen] = useState<boolean>(true);
  const [selectedStyle, setSelectedStyle] = useState<string>('clean');

  const handleImageUpload = useCallback((image: UploadedImage) => {
    setState(prev => ({
      ...prev,
      uploadedImages: [...prev.uploadedImages.filter(img => img.type !== image.type), image]
    }));

    switch (image.type) {
      case 'person':
        setPersonImage(image);
        break;
      case 'product':
        setProductImage(image);
        break;
      case 'sketch':
        setSketchImage(image);
        break;
    }
  }, []);

  const handleImageRemove = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      uploadedImages: prev.uploadedImages.filter(img => img.id !== id)
    }));

    if (personImage?.id === id) setPersonImage(null);
    if (productImage?.id === id) setProductImage(null);
    if (sketchImage?.id === id) setSketchImage(null);
  }, [personImage, productImage, sketchImage]);

  const handleGenerate = useCallback(async () => {
    setState(prev => ({ ...prev, isGenerating: true }));
    
    // 실제 API 호출 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 더미 포스터 이미지 URL
    const dummyPosterUrl = 'https://via.placeholder.com/400x600/1E293B/FFFFFF?text=Generated+Poster';
    
    // 기본 스켈레톤 포즈 생성
    const defaultPose = {
      points: [
        // 머리
        { id: 'head', x: 175, y: 80, name: '머리', color: '#8B5CF6' },
        { id: 'neck', x: 175, y: 120, name: '목', color: '#A855F7' },
        
        // 몸통
        { id: 'chest', x: 175, y: 160, name: '가슴', color: '#3B82F6' },
        { id: 'waist', x: 175, y: 220, name: '허리', color: '#10B981' },
        
        // 팔
        { id: 'left_shoulder', x: 135, y: 140, name: '왼쪽 어깨', color: '#10B981' },
        { id: 'left_elbow', x: 95, y: 180, name: '왼쪽 팔꿈치', color: '#06B6D4' },
        { id: 'left_wrist', x: 75, y: 220, name: '왼쪽 손목', color: '#059669' },
        
        { id: 'right_shoulder', x: 215, y: 140, name: '오른쪽 어깨', color: '#F59E0B' },
        { id: 'right_elbow', x: 255, y: 180, name: '오른쪽 팔꿈치', color: '#EAB308' },
        { id: 'right_wrist', x: 275, y: 220, name: '오른쪽 손목', color: '#84CC16' },
        
        // 다리
        { id: 'left_hip', x: 155, y: 280, name: '왼쪽 엉덩이', color: '#06B6D4' },
        { id: 'left_knee', x: 145, y: 380, name: '왼쪽 무릎', color: '#3B82F6' },
        { id: 'left_ankle', x: 135, y: 460, name: '왼쪽 발목', color: '#8B5CF6' },
        
        { id: 'right_hip', x: 195, y: 280, name: '오른쪽 엉덩이', color: '#10B981' },
        { id: 'right_knee', x: 205, y: 380, name: '오른쪽 무릎', color: '#3B82F6' },
        { id: 'right_ankle', x: 215, y: 460, name: '오른쪽 발목', color: '#8B5CF6' },
      ],
      connections: [
        // 머리-목-가슴
        { from: 'head', to: 'neck', color: '#8B5CF6' },
        { from: 'neck', to: 'chest', color: '#3B82F6' },
        { from: 'chest', to: 'waist', color: '#10B981' },
        
        // 왼쪽 팔
        { from: 'chest', to: 'left_shoulder', color: '#10B981' },
        { from: 'left_shoulder', to: 'left_elbow', color: '#06B6D4' },
        { from: 'left_elbow', to: 'left_wrist', color: '#059669' },
        
        // 오른쪽 팔
        { from: 'chest', to: 'right_shoulder', color: '#F59E0B' },
        { from: 'right_shoulder', to: 'right_elbow', color: '#EAB308' },
        { from: 'right_elbow', to: 'right_wrist', color: '#84CC16' },
        
        // 왼쪽 다리
        { from: 'waist', to: 'left_hip', color: '#06B6D4' },
        { from: 'left_hip', to: 'left_knee', color: '#3B82F6' },
        { from: 'left_knee', to: 'left_ankle', color: '#8B5CF6' },
        
        // 오른쪽 다리
        { from: 'waist', to: 'right_hip', color: '#10B981' },
        { from: 'right_hip', to: 'right_knee', color: '#3B82F6' },
        { from: 'right_knee', to: 'right_ankle', color: '#8B5CF6' },
      ]
    };
    
    setState(prev => ({
      ...prev,
      step: 'edit',
      generatedPoster: dummyPosterUrl,
      currentPose: defaultPose,
      isGenerating: false
    }));
  }, []);

  const handlePoseChange = useCallback((pose: SkeletonPose) => {
    setState(prev => ({ ...prev, currentPose: pose }));
  }, []);

  const handleComplete = useCallback(() => {
    navigate(PATHS.HOME);
  }, [navigate]);

  const canGenerate = state.prompt.trim().length > 0 && 
    (personImage || productImage || sketchImage);

  return (
    <div className="w-full min-h-screen bg-background">
      <StyleSelectionDialog
        isOpen={isStyleDialogOpen}
        onStyleSelect={(styleId)=>{ setSelectedStyle(styleId); setIsStyleDialogOpen(false); }}
        onClose={()=> setIsStyleDialogOpen(false)}
      />
      <Navigation />
      
      <div className="flex flex-row w-full max-w-[1200px] mx-auto">
        <div className="flex-1 flex flex-col md:p-8 pr-[560px]">
        {/* Header */}
        <header className="flex items-start justify-between">
          <div></div>
        </header>

        {/* 포스터 생성 영역 */}
        <section className="mt-10 flex justify-center px-4">
          {/* 가운데: Canvas + 프롬프트 */}
          <main className="relative flex flex-col items-center max-w-2xl w-full min-h-[calc(100vh-180px)]">
            <div className="relative w-full max-w-[640px] aspect-square rounded-3xl border-2 border-dotted border-primary/80 shadow-xl shadow-primary/10 flex items-center justify-center">
              {state.generatedPoster ? (
                <img
                  src={state.generatedPoster}
                  alt="Generated Poster"
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <div className="text-center text-text-color opacity-60">
                  <div className="text-4xl mb-2">🎨</div>
                  <p>생성된 포스터가 여기에 표시됩니다</p>
                </div>
              )}
              
              {/* 포스터 위 버튼들 */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                {state.generatedPoster && (
                  <button className="px-3 py-1 bg-primary text-background rounded-md text-xs hover:bg-primary/90 transition-colors shadow-lg">
                    다운로드
                  </button>
                )}
                <button className="px-3 py-1 border border-primary text-primary rounded-md text-xs hover:bg-primary hover:text-background transition-colors shadow-lg">
                  Archive 바로가기
                </button>
              </div>
            </div>
            
            {/* 하단 프롬프트 영역 - 화면 하단에 붙도록 */}
            <div className="w-full mt-auto pt-6">
              <PromptInput
                value={state.prompt}
                onChange={(value) => setState(prev => ({ ...prev, prompt: value }))}
                onGenerate={handleGenerate}
                isGenerating={state.isGenerating}
              />
            </div>
          </main>
        </section>
      </div>

      {/* 오른쪽: 통합 사이드바 */}
      <aside className="fixed right-0 top-20 h-[calc(100vh-80px)] w-[520px] border-l border-white/10 p-6 flex flex-col gap-8 bg-background/95 backdrop-blur-sm z-10 overflow-y-auto">
        {state.step === 'edit' && state.currentPose ? (
          <>
            {/* 포즈 조정 */}
            <section className="flex flex-col gap-3 mt-10">
              <h3 className="text-lg font-semibold border-b border-white/20 pb-1 text-text-color">포즈 조정</h3>
              <SkeletonCanvas
                pose={state.currentPose}
                onPoseChange={handlePoseChange}
              />
            </section>

            {/* 버튼들 */}
            <div className="flex flex-col gap-3 flex-1 justify-end">
              <button
                onClick={handleGenerate}
                disabled={state.isGenerating}
                className="w-full bg-primary text-background py-3 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {state.isGenerating ? '재생성 중...' : '포즈 적용하여 재생성'}
              </button>
              
              <button
                onClick={handleComplete}
                className="w-full border border-primary text-primary py-3 rounded-md font-medium transition-colors hover:bg-primary hover:text-background"
              >
                완료하고 홈으로
              </button>
            </div>
          </>
        ) : (
          <>
            {/* 아코디언 형태 섹션: 파일/텍스트/구도 */}
            <div className="mt-8 space-y-4">
              <Accordion title="파일 첨부하기" defaultOpen>
                <UploadDropzone onUpload={({type, image})=>{ if(!image) return; handleImageUpload(image); }} />
              </Accordion>
              <Accordion title="텍스트 입력하기">
                <p className="text-text-color/80 text-sm">하단 프롬프트에 원하는 내용을 입력해 주세요.</p>
              </Accordion>
              <Accordion title="구도 수정하기">
                <p className="text-text-color/80 text-sm">생성 후 포즈 조정 화면에서 스켈레톤을 드래그해 수정할 수 있어요.</p>
              </Accordion>
            </div>

            {/* 현재 상태 */}
            <section className="flex flex-col gap-3 flex-1 mt-6">
              <h3 className="text-lg font-semibold border-b border-white/20 pb-1 text-text-color">현재 상태</h3>
              <div className="text-text-color text-sm space-y-2 opacity-80">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${personImage ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                  <span>인물 사진: {personImage ? '업로드됨' : '미업로드'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${productImage ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                  <span>상품 사진: {productImage ? '업로드됨' : '미업로드'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${sketchImage ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                  <span>스케치 사진: {sketchImage ? '업로드됨' : '미업로드'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${state.prompt.trim() ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                  <span>프롬프트: {state.prompt.trim() ? '입력됨' : '미입력'}</span>
                </div>
              </div>
            </section>
          </>
        )}
      </aside>
      </div>
    </div>
  );
};

export default PosterPage;

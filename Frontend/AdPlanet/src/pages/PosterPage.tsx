import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PromptInput from '../components/PromptInput';
import SkeletonCanvas from '../components/SkeletonCanvas';
import StyleSelectionDialog from '../components/StyleSelectionDialog';
import Accordion from '../components/Accordion';
import UploadDropzone from '../components/UploadDropzone';
import TextEditor from '../components/TextEditor';
import ChatRoomList from '../components/ChatRoomList';
import GenerationHistory from '../components/GenerationHistory';
import { Button } from '../components/Button';
import type { UploadedImage, PosterGenerationState, SkeletonPose, TextOverlay, ChatRoom, GenerationRecord } from '../types/poster';
import { PATHS } from '../constants/paths';

const PosterPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [state, setState] = useState<PosterGenerationState>({
    step: 'upload',
    uploadedImages: [],
    generatedPoster: '/src/assets/poster.jpg', // 테스트용 이미지
    currentPose: null,
    prompt: '',
    isGenerating: false,
    textOverlays: [],
    title: '',
    content: ''
  });

  const [personImage, setPersonImage] = useState<UploadedImage | null>(null);
  const [productImage, setProductImage] = useState<UploadedImage | null>(null);
  const [sketchImage, setSketchImage] = useState<UploadedImage | null>(null);
  const [isStyleDialogOpen, setIsStyleDialogOpen] = useState<boolean>(true);
  const [selectedTextId, setSelectedTextId] = useState<string | undefined>();
  const [isFileAccordionOpen, setIsFileAccordionOpen] = useState(false);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  
  // 채팅방 관련 상태  
  const [isChatListOpen, setIsChatListOpen] = useState(false);

  // 파일 첨부 아코디언 자동 닫기 핸들러
  const handleOutsideClick = useCallback(() => {
    if (isFileAccordionOpen) {
      setIsFileAccordionOpen(false);
    }
  }, [isFileAccordionOpen]);

  // ESC 키로 이미지 프리뷰 닫기
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isImagePreviewOpen) {
        setIsImagePreviewOpen(false);
      }
    };

    if (isImagePreviewOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isImagePreviewOpen]);
  const [currentRoomId, setCurrentRoomId] = useState<string>('room-1');
  const [selectedRecordId, setSelectedRecordId] = useState<string | undefined>();
  
  // 더미 채팅방 데이터
  const [chatRooms] = useState<ChatRoom[]>([
    {
      id: 'room-1',
      title: '새 포스터 프로젝트',
      lastUpdated: new Date(),
      messageCount: 5,
      isActive: true
    },
    {
      id: 'room-2',
      title: '여름 세일 포스터',
      lastUpdated: new Date(Date.now() - 86400000), // 어제
      thumbnail: '/src/assets/poster.jpg',
      messageCount: 12,
      isActive: false
    },
    {
      id: 'room-3',
      title: '신제품 런칭 광고',
      lastUpdated: new Date(Date.now() - 172800000), // 2일 전
      thumbnail: '/src/assets/poster.jpg',
      messageCount: 8,
      isActive: false
    }
  ]);
  
  // 더미 생성 기록 데이터
  const [generationRecords] = useState<GenerationRecord[]>([
    {
      id: 'record-1',
      timestamp: new Date(Date.now() - 300000), // 5분 전
      thumbnail: '/src/assets/poster.jpg',
      prompt: '깔끔한 포스터 생성',
      step: 'upload',
      status: 'completed'
    },
    {
      id: 'record-2',
      timestamp: new Date(Date.now() - 180000), // 3분 전
      thumbnail: '/src/assets/poster.jpg',
      prompt: '포즈 조정된 포스터',
      step: 'edit',
      status: 'completed'
    },
    {
      id: 'record-3',
      timestamp: new Date(Date.now() - 60000), // 1분 전
      thumbnail: '/src/assets/poster.jpg',
      prompt: '텍스트 추가된 포스터',
      step: 'text-edit',
      status: 'generating'
    }
  ]);

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

  const handleImageRemove = useCallback((type: 'person' | 'product' | 'sketch') => {
    setState(prev => ({
      ...prev,
      uploadedImages: prev.uploadedImages.filter(img => img.type !== type)
    }));

    switch (type) {
      case 'person':
        setPersonImage(null);
        break;
      case 'product':
        setProductImage(null);
        break;
      case 'sketch':
        setSketchImage(null);
        break;
    }
  }, []);


  const handleGenerate = useCallback(async () => {
    setState(prev => ({ ...prev, isGenerating: true }));
    
    // 실제 API 호출 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 더미 포스터 이미지 URL
    const dummyPosterUrl = '/src/assets/poster.jpg';
    
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

  // 텍스트 관련 핸들러들
  const handleAddText = useCallback((textOverlay: TextOverlay) => {
    setState(prev => ({
      ...prev,
      textOverlays: [...prev.textOverlays, textOverlay],
      step: 'text-edit'
    }));
  }, []);

  const handleUpdateText = useCallback((id: string, updates: Partial<TextOverlay>) => {
    setState(prev => ({
      ...prev,
      textOverlays: prev.textOverlays.map(text => 
        text.id === id ? { ...text, ...updates } : text
      )
    }));
  }, []);

  const handleRemoveText = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      textOverlays: prev.textOverlays.filter(text => text.id !== id)
    }));
  }, []);

  const handleTextPositionChange = useCallback((id: string, x: number, y: number) => {
    handleUpdateText(id, { x, y });
  }, [handleUpdateText]);

  // 채팅방 관련 핸들러들
  const handleSelectRoom = useCallback((roomId: string) => {
    setCurrentRoomId(roomId);
    setIsChatListOpen(false);
    // 실제로는 선택된 방의 데이터를 로드
  }, []);

  const handleNewRoom = useCallback(() => {
    const newRoomId = `room-${Date.now()}`;
    setCurrentRoomId(newRoomId);
    setIsChatListOpen(false);
    // 새 방 생성 로직
  }, []);

  const handleSelectRecord = useCallback((recordId: string) => {
    setSelectedRecordId(selectedRecordId === recordId ? undefined : recordId);
    // 선택된 기록으로 상태 복원
  }, [selectedRecordId]);

  return (
    <div className="w-full h-screen bg-background overflow-hidden flex">
      <StyleSelectionDialog
        isOpen={isStyleDialogOpen}
        onStyleSelect={()=>{ setIsStyleDialogOpen(false); }}
        onClose={()=> setIsStyleDialogOpen(false)}
      />
      
      {/* 채팅방 목록 사이드바 */}
      <ChatRoomList
        chatRooms={chatRooms}
        currentRoomId={currentRoomId}
        onSelectRoom={handleSelectRoom}
        onNewRoom={handleNewRoom}
        isOpen={isChatListOpen}
        onToggle={() => setIsChatListOpen(!isChatListOpen)}
      />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isChatListOpen ? 'lg:ml-72' : 'lg:ml-16'}`} style={{ height: 'calc(100vh - 0px)' }}>
        {/* Header + 생성 히스토리 통합 */}
        <header className="flex items-center justify-between p-6 border-b border-white/5 flex-shrink-0 bg-background/50 backdrop-blur-xl">
          {/* 왼쪽: AdPlanet 로고 */}
          <div className="flex items-center">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">AdPlanet</h1>
              <p className="text-sm text-text-color/60 mt-1">AI 포스터 생성 스튜디오</p>
            </div>
          </div>
          
          {/* 중앙: 생성 히스토리 컨트롤 */}
          <div className="flex items-center gap-2 bg-background/30 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-color">생성 히스토리</h3>
              <p className="text-xs text-text-color/60">{generationRecords.length}개의 단계</p>
            </div>
            <button 
              onClick={() => {
                // 생성 히스토리 다이얼로그 열기
                const event = new CustomEvent('openGenerationHistory');
                window.dispatchEvent(event);
              }}
              className="p-2 text-text-color/60 hover:text-text-color hover:bg-white/5 rounded-lg transition-all ml-2"
            >
              <svg 
                className="w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          
          {/* 오른쪽: 액션 버튼들 */}
          <div className="flex items-center gap-3">
            <Button text="내보내기" variant="outline" size="xs" />
            <Button text="아카이브" variant="outline" size="xs" />
            <div className="w-8 h-8 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
            </div>
          </div>
        </header>

        {/* 생성 과정 히스토리 - 이벤트 기반으로 처리 */}
        <GenerationHistory
          records={generationRecords}
          onSelectRecord={handleSelectRecord}
          selectedRecordId={selectedRecordId}
        />

        <div className="flex-1 flex flex-row min-h-0">

          {/* 포스터 생성 영역 */}
          <div className="flex-1 flex flex-col p-4 lg:p-6 min-h-0 max-h-full" onClick={handleOutsideClick}>
            {/* 가운데: Canvas + 프롬프트 */}
            <main className="relative flex flex-col items-center w-full max-w-[500px] mx-auto flex-1 min-h-0">
              <div 
                className="relative w-full aspect-square max-w-[400px] max-h-[50vh] rounded-3xl border-2 border-dashed border-primary/30 hover:border-primary/50 shadow-2xl shadow-primary/5 bg-gradient-to-br from-background to-background/50 backdrop-blur-sm flex items-center justify-center transition-all duration-300 group cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  if (state.generatedPoster) {
                    setIsImagePreviewOpen(true);
                  }
                }}
              >
                {state.generatedPoster ? (
                  <div className="relative w-full h-full">
                    <img
                      src={state.generatedPoster}
                      alt="Generated Poster"
                      className="w-full h-full object-cover rounded-2xl"
                    />
                    
                    {/* 텍스트 오버레이들 */}
                    {state.textOverlays.map((text) => (
                      <div
                        key={text.id}
                        className={`absolute cursor-move select-none ${
                          selectedTextId === text.id ? 'ring-2 ring-primary' : ''
                        }`}
                        style={{
                          left: `${text.x}%`,
                          top: `${text.y}%`,
                          fontSize: `${text.fontSize}px`,
                          color: text.color,
                          fontWeight: text.fontWeight,
                          fontFamily: text.fontFamily,
                          transform: 'translate(-50%, -50%)',
                          textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                        }}
                        onClick={() => setSelectedTextId(selectedTextId === text.id ? undefined : text.id)}
                        onMouseDown={(e) => {
                          const rect = e.currentTarget.parentElement!.getBoundingClientRect();
                          const startX = e.clientX;
                          const startY = e.clientY;
                          const startLeft = text.x;
                          const startTop = text.y;

                          const handleMouseMove = (e: MouseEvent) => {
                            const deltaX = ((e.clientX - startX) / rect.width) * 100;
                            const deltaY = ((e.clientY - startY) / rect.height) * 100;
                            const newX = Math.max(0, Math.min(100, startLeft + deltaX));
                            const newY = Math.max(0, Math.min(100, startTop + deltaY));
                            handleTextPositionChange(text.id, newX, newY);
                          };

                          const handleMouseUp = () => {
                            document.removeEventListener('mousemove', handleMouseMove);
                            document.removeEventListener('mouseup', handleMouseUp);
                          };

                          document.addEventListener('mousemove', handleMouseMove);
                          document.addEventListener('mouseup', handleMouseUp);
                        }}
                      >
                        {text.text}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-text-color/60 group-hover:text-text-color/80 transition-colors">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl flex items-center justify-center group-hover:scale-105 transition-transform">
                      <svg className="w-12 h-12 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">포스터 캔버스</h3>
                    <p className="text-sm text-text-color/50 max-w-sm mx-auto leading-relaxed">
                      파일을 업로드하고 프롬프트를 입력하여<br />
                      AI가 생성한 포스터를 확인하세요
                    </p>
                  </div>
                )}
                
                {/* 포스터 위 버튼들 */}
                {state.generatedPoster && (
                  <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="px-4 py-2 bg-background/90 backdrop-blur-sm text-text-color rounded-xl text-sm hover:bg-background transition-all shadow-lg border border-white/10">
                      <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0l-4 4m4-4v12" />
                      </svg>
                      내보내기
                    </button>
                  </div>
                )}
              </div>
              
              {/* 하단 프롬프트 영역 - 고정 위치 */}
              <div className="w-full flex-shrink-0 mt-4">
                <div className="bg-background/80 backdrop-blur-xl rounded-xl border border-white/10 p-4 shadow-xl">
                  <PromptInput
                    value={state.prompt}
                    onChange={(value) => setState(prev => ({ ...prev, prompt: value }))}
                    onGenerate={handleGenerate}
                    isGenerating={state.isGenerating}
                  />
                </div>
              </div>
            </main>
          </div>

          {/* 오른쪽: 통합 사이드바 */}
          <aside className={`${
            state.step === 'edit' && state.currentPose 
              ? 'w-[400px] lg:w-[480px]' 
              : 'w-[300px] lg:w-[340px]'
          } border-l border-white/5 bg-background/50 backdrop-blur-xl overflow-y-auto scrollbar-hidden transition-all duration-300`} style={{ height: '100%' }}>
            <div className="p-4 flex flex-col gap-4">
        {state.step === 'text-edit' ? (
          <>
            {/* 텍스트 편집 */}
            <section className="flex flex-col gap-3 flex-1 min-h-0">
              <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-text-color">텍스트 편집</h3>
              </div>
              <div className="flex-1 overflow-y-auto">
                <TextEditor
                  textOverlays={state.textOverlays}
                  onAddText={handleAddText}
                  onUpdateText={handleUpdateText}
                  onRemoveText={handleRemoveText}
                  selectedTextId={selectedTextId}
                  onSelectText={setSelectedTextId}
                />
              </div>
            </section>

            {/* 버튼들 */}
            <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => setState(prev => ({ 
                  ...prev, 
                  step: 'edit',
                  textOverlays: [] // 텍스트 오버레이 모두 제거
                }))}
                className="w-full flex items-center justify-center gap-2 border border-primary/30 text-primary py-3 rounded-xl font-medium transition-all hover:bg-primary/10 hover:border-primary/50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                포즈 편집으로 돌아가기
              </button>
              
              <button
                onClick={handleComplete}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary/80 text-background py-3 rounded-xl font-medium transition-all hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                완료하고 홈으로
              </button>
            </div>
          </>
        ) : state.step === 'edit' && state.currentPose ? (
          <div className="h-full flex flex-col">
            {/* 포즈 조정 */}
            <section className="flex flex-col gap-3 flex-1 min-h-0">
              <div className="flex items-center gap-3 pb-3 border-b border-white/10 flex-shrink-0">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-text-color">포즈 조정</h3>
              </div>
              <div className="bg-background/50 rounded-xl border border-white/10 p-3 flex-1 min-h-0 flex items-center justify-center">
                <div className="w-full h-full max-w-md max-h-full">
                  <SkeletonCanvas
                    pose={state.currentPose}
                    onPoseChange={handlePoseChange}
                    width={state.step === 'edit' ? 360 : 350}
                    height={state.step === 'edit' ? 480 : 500}
                  />
                </div>
              </div>
            </section>

            {/* 버튼들 */}
            <div className="flex flex-col gap-3 pt-4 border-t border-white/10 flex-shrink-0">
              <button
                onClick={async () => {
                  await handleGenerate();
                  // 재생성 후 텍스트 편집 단계로 이동
                  setState(prev => ({ ...prev, step: 'text-edit' }));
                }}
                disabled={state.isGenerating}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary/80 text-background py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl"
              >
                {state.isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin"></div>
                    재생성 중...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    포즈 적용하여 재생성
                  </>
                )}
              </button>
              
              <button
                onClick={handleComplete}
                className="w-full flex items-center justify-center gap-2 border border-primary/30 text-primary py-3 rounded-xl font-medium transition-all hover:bg-primary/10 hover:border-primary/50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                완료하고 홈으로
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* 파일 첨부 */}
            <section 
              className="bg-background/50 rounded-xl border border-white/10 overflow-hidden flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <Accordion 
                title="파일 첨부하기" 
                isOpen={isFileAccordionOpen}
                onToggle={(isOpen) => setIsFileAccordionOpen(isOpen)}
              >
                <UploadDropzone 
                  onUpload={({image})=>{ if(!image) return; handleImageUpload(image); }}
                  uploadedImages={{
                    person: personImage,
                    product: productImage,
                    sketch: sketchImage
                  }}
                  onRemove={handleImageRemove}
                />
              </Accordion>
            </section>

            {/* 기본 정보 입력 */}
            <section className="flex flex-col gap-3 flex-shrink-0" onClick={handleOutsideClick}>
              <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-text-color">기본 정보</h3>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="포스터 제목"
                  value={state.title}
                  onChange={(e) => setState(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full rounded-lg bg-background/50 border border-primary/20 px-3 py-2 text-sm text-text-color placeholder-text-color/60 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                />
                <textarea
                  placeholder="포스터 내용 (선택사항)"
                  value={state.content}
                  onChange={(e) => setState(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full h-16 resize-none rounded-lg bg-background/50 border border-primary/20 px-3 py-2 text-sm text-text-color placeholder-text-color/60 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                  maxLength={200}
                />
                <div className="flex justify-end text-xs text-text-color/60">
                  <span>{state.content.length} / 200</span>
                </div>
              </div>
            </section>

            {/* 현재 상태 - 아코디언이 닫혀있을 때만 표시 */}
            {!isFileAccordionOpen && (
              <section className="flex flex-col gap-3 flex-shrink-0" onClick={handleOutsideClick}>
              <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-text-color">현재 상태</h3>
              </div>
              <div className="bg-background/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${state.title.trim() ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                    <span className="text-sm font-medium">제목</span>
                  </div>
                  <span className="text-xs text-text-color/60">{state.title.trim() ? '완료' : '대기중'}</span>
                </div>
                
                <div className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${state.content.trim() ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                    <span className="text-sm font-medium">내용</span>
                  </div>
                  <span className="text-xs text-text-color/60">{state.content.trim() ? '완료' : '선택사항'}</span>
                </div>
                
                <div className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${personImage ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                    <span className="text-sm font-medium">인물 사진</span>
                  </div>
                  <span className="text-xs text-text-color/60">{personImage ? '업로드됨' : '대기중'}</span>
                </div>
                
                <div className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${productImage ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                    <span className="text-sm font-medium">상품 사진</span>
                  </div>
                  <span className="text-xs text-text-color/60">{productImage ? '업로드됨' : '대기중'}</span>
                </div>
                
                <div className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${state.prompt.trim() ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                    <span className="text-sm font-medium">프롬프트</span>
                  </div>
                  <span className="text-xs text-text-color/60">{state.prompt.trim() ? '완료' : '대기중'}</span>
                </div>
              </div>
            </section>
            )}
          </div>
        )}
            </div>
          </aside>
        </div>
      </div>

      {/* 이미지 프리뷰 오버레이 */}
      {isImagePreviewOpen && state.generatedPoster && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center transition-all duration-300 ease-out opacity-100"
          onClick={() => setIsImagePreviewOpen(false)}
        >
          <div 
            className="relative rounded-2xl shadow-2xl transform transition-all duration-300 ease-out scale-100 translate-y-0 opacity-100"
            onClick={(e) => e.stopPropagation()}
            style={{ 
              maxWidth: '95vw', 
              maxHeight: '95vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <img
              src={state.generatedPoster}
              alt="포스터 원본"
              className="max-w-full max-h-full object-contain rounded-2xl"
              style={{
                maxWidth: '95vw',
                maxHeight: '95vh',
                width: 'auto',
                height: 'auto'
              }}
            />
            
            {/* 안내 텍스트 */}
            <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm font-medium">
              ESC 키나 배경 클릭으로 닫기
            </div>
            
            {/* 닫기 버튼 */}
            <button
              onClick={() => setIsImagePreviewOpen(false)}
              className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-black/90 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PosterPage;

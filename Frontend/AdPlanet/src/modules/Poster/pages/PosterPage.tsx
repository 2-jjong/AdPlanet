import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PromptInput from "../components/PromptInput";
// SkeletonCanvas is consumed inside PosterSidebar
import StyleSelectionDialog from "../components/StyleSelectionDialog";
import Accordion from "../components/Accordion";
import UploadDropzone from "../components/UploadDropzone";
// TextEditor is now used inside PosterSidebar
import GroupList from "../components/GroupList";
import GenerationHistory from "../components/GenerationHistory";
import PosterTopBar from "../components/PosterTopBar";
import PosterCanvasView from "../components/PosterCanvasView";
import PosterSidebar from "../components/PosterSidebar";
import type { SkeletonCanvasHandle } from "../components/SkeletonCanvas";
import type { UploadedImage, PosterGenerationState, SkeletonPose, TextOverlay, GenerationRecord } from "../../../types/poster";
import { PATHS } from "../../../constants/paths";
import { useCreatePosterMutation } from "../hooks/usePosterMutations";
import type { UiPosterStyle } from "../hooks/usePosterMutations";
import { usePosterGroups, usePosterGroupDetail, usePosterJob, posterKeys } from "../hooks/usePosterQueries";
import { useQueryClient } from "@tanstack/react-query";
import { defaultSkeletonPose } from "../components/defaultPose";
import TagDialog from "../components/TagDialog";
import { generatePosterCopy } from "../../../services/posterService";
import { composeAndUploadPoster } from "../utils/composeAndUploadPoster";

const PosterPage: React.FC = () => {
  const navigate = useNavigate();

  const [state, setState] = useState<PosterGenerationState>({
    step: "upload",
    uploadedImages: [],
    generatedPoster: null,
    currentPose: null,
    prompt: "",
    isGenerating: false,
    textOverlays: [],
    title: "",
    content: "",
  });

  const [personImage, setPersonImage] = useState<UploadedImage | null>(null);
  const [productImage, setProductImage] = useState<UploadedImage | null>(null);
  const [sketchImage, setSketchImage] = useState<UploadedImage | null>(null);
  const [isStyleDialogOpen, setIsStyleDialogOpen] = useState<boolean>(true);
  const [uiStyle, setUiStyle] = useState<UiPosterStyle>(undefined);
  const [selectedTextId, setSelectedTextId] = useState<string | undefined>();
  const [isFileAccordionOpen, setIsFileAccordionOpen] = useState(false);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const createPosterMutation = useCreatePosterMutation();
  const skeletonCanvasRef = React.useRef<SkeletonCanvasHandle | null>(null);
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const posterContainerRef = React.useRef<HTMLDivElement | null>(null);
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);

  // 그룹 목록 사이드바 상태
  const [isGroupListOpen, setIsGroupListOpen] = useState(false);
  const groupsQuery = usePosterGroups({ order: 'NEWEST' });
  const queryClient = useQueryClient();

  // 파일 첨부 아코디언 자동 닫기 핸들러
  const handleOutsideClick = useCallback(() => {
    if (isFileAccordionOpen) {
      setIsFileAccordionOpen(false);
    }
  }, [isFileAccordionOpen]);

  // ESC 키로 이미지 프리뷰 닫기
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isImagePreviewOpen) {
        setIsImagePreviewOpen(false);
      }
    };

    if (isImagePreviewOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isImagePreviewOpen]);
  const [selectedRecordId, setSelectedRecordId] = useState<string | undefined>();
  const [currentGroupId, setCurrentGroupId] = useState<number | undefined>(undefined);
  const [currentJobId, setCurrentJobId] = useState<string | undefined>(undefined);
  const [currentPosterId, setCurrentPosterId] = useState<number | undefined>(undefined);

  // 생성 히스토리 (그룹 선택 시 서버 데이터로 갱신)
  const [generationRecords, setGenerationRecords] = useState<GenerationRecord[]>([]);

  // 합성/업로드 호출용 래퍼
  const doComposeAndUpload = useCallback(async (groupId: number) => {
    const posterElement = posterContainerRef.current;
    if (!posterElement || !currentPosterId) {
      throw new Error('Poster container or posterId not found');
    }
    
    await composeAndUploadPoster({ 
      groupId, 
      posterId: currentPosterId,
      posterElement 
    });
  }, [posterContainerRef, currentPosterId]);

  const handleImageUpload = useCallback((image: UploadedImage) => {
    setState((prev) => ({
      ...prev,
      uploadedImages: [...prev.uploadedImages.filter((img) => img.type !== image.type), image],
    }));

    switch (image.type) {
      case "person":
        setPersonImage(image);
        break;
      case "product":
        setProductImage(image);
        break;
      case "sketch":
        setSketchImage(image);
        break;
    }
  }, []);

  const handleImageRemove = useCallback((type: "person" | "product" | "sketch") => {
    setState((prev) => ({
      ...prev,
      uploadedImages: prev.uploadedImages.filter((img) => img.type !== type),
    }));

    switch (type) {
      case "person":
        setPersonImage(null);
        break;
      case "product":
        setProductImage(null);
        break;
      case "sketch":
        setSketchImage(null);
        break;
    }
  }, []);

  const handleGenerate = useCallback(async () => {
    // 첫 생성은 업로드/프롬프트 중 하나가 있어야 하고,
    // 구도 조정(이미 생성본 존재)일 때는 previousImage 로만 생성 허용
    if (!personImage && !productImage && !sketchImage && !state.prompt.trim() && !state.generatedPoster) {
      return;
    }

    setState((prev) => ({ ...prev, isGenerating: true }));
    // 로컬 히스토리에 generating 항목 추가 (플레이스홀더)
    const pendingId = `pending-${Date.now()}`;
    setGenerationRecords((prev) => [
      ...prev,
      {
        id: pendingId,
        timestamp: new Date(),
        thumbnail: prev.length > 0 ? (prev[prev.length - 1].thumbnail) : (state.generatedPoster ?? ''),
        prompt: state.prompt || '생성 요청',
        step: 'generate',
        status: 'generating',
      },
    ]);

    try {
      // 첫 생성 여부 판단: 히스토리/현재 이미지가 전혀 없으면 첫 생성으로 간주
      const lastRecord = generationRecords.length > 0 ? generationRecords[generationRecords.length - 1] : undefined;
      const isFirstGeneration = !state.generatedPoster && !lastRecord;

      // 구도 조정(첫 생성이 아닌 경우)일 때 캔버스에 보이는 이미지를 previousImage 로 첨부
      let previousFile: File | null = null;
      if (!isFirstGeneration) {
        const sourceUrl = state.generatedPoster || lastRecord?.thumbnail || '';
        if (sourceUrl) {
          try {
            const res = await fetch(sourceUrl, { mode: 'cors' });
            const blob = await res.blob();
            const ext = blob.type.includes('jpeg') ? 'jpg' : blob.type.split('/')[1] || 'png';
            previousFile = new File([blob], `previous.${ext}`, { type: blob.type || 'image/png' });
          } catch (_) {
            previousFile = null;
          }
        }
      }

      // 스켈레톤 캔버스 PNG 추출
      let skeletonFile: File | null = null;
      if (skeletonCanvasRef.current && state.currentPose) {
        try {
          const blob = await skeletonCanvasRef.current.toBlob();
          skeletonFile = new File([blob], 'skeleton.png', { type: 'image/png' });
        } catch (_) {
          skeletonFile = null;
        }
      }

      console.log('[handleGenerate] currentStep before request:', state.step);

      const res = await createPosterMutation.mutateAsync({
        groupId: currentGroupId, // 없으면 생략되어 서버가 새 그룹을 생성
        title: state.title || 'Untitled',
        content: state.content || undefined,
        prompt: state.prompt,
        style: uiStyle, // 스타일을 쿼리 파라미터로 전달
        images: {
          person: personImage?.file ?? null,
          product: productImage?.file ?? null,
          sketch: sketchImage?.file ?? null,
          skeleton: skeletonFile,
          // 첫 생성이면 null, 구도 조정이면 현재 캔버스 이미지를 첨부
          previous: previousFile,
        },
      });

      const jobId = res.data?.jobId;
      if (jobId) {
        setCurrentJobId(jobId);
      } else {
        setState((prev) => ({ ...prev, isGenerating: false }));
      }
    } catch (e) {
      setState((prev) => ({ ...prev, isGenerating: false }));
      // 실패로 표시
      setGenerationRecords((prev) =>
        prev.map((r) => (r.id.startsWith('pending-') ? { ...r, status: 'failed' } : r))
      );
    }
  }, [
    createPosterMutation,
    personImage,
    productImage,
    sketchImage,
    state.title,
    state.content,
    state.prompt,
    state.generatedPoster,
    state.step,
    state.currentPose,
    generationRecords,
    currentGroupId,
  ]);

  // 3초 간격으로 생성 작업 상태 폴링
  const jobQuery = usePosterJob(currentJobId as string, { enabled: !!currentJobId, interval: 3000 });

  React.useEffect(() => {
    if (!currentJobId) return;
    const job = jobQuery.data;
    const status = job?.status?.toString().toUpperCase();
    if (!status) return;
    if (status === 'COMPLETED' && job?.result) {
      const finalUrl = job.result.imgUrl;
      const finalGroupId = job.result.groupId;
      const finalPosterId = job.result.posterId;
      setState((prev) => {
        const nextStep = prev.step === 'edit' ? 'text-edit' : 'edit';
        if ((import.meta as any)?.env?.DEV) {
          // eslint-disable-next-line no-console
          console.log('[jobComplete] Transitioning to step:', nextStep);
        }
        return {
          ...prev,
          step: nextStep,
          generatedPoster: finalUrl ?? prev.generatedPoster,
          currentPose: nextStep === 'text-edit' ? null : (prev.currentPose ?? defaultSkeletonPose),
          isGenerating: false,
        };
      });
      if (typeof finalGroupId === 'number' && Number.isFinite(finalGroupId)) {
        setCurrentGroupId(finalGroupId);
        if (typeof finalPosterId === 'number') setCurrentPosterId(finalPosterId);
        // 그룹/히스토리 데이터 동기화
        queryClient.invalidateQueries({ queryKey: posterKeys.groups() });
        queryClient.invalidateQueries({ queryKey: posterKeys.groupDetail(finalGroupId) });
      } else {
        queryClient.invalidateQueries({ queryKey: posterKeys.groups() });
      }
      // 마지막 pending 항목을 completed로 교체/업데이트
      setGenerationRecords((prev) => {
        const updated = [...prev];
        for (let i = updated.length - 1; i >= 0; i--) {
          if (updated[i].status === 'generating') {
            updated[i] = {
              ...updated[i],
              status: 'completed',
              thumbnail: finalUrl || updated[i].thumbnail,
              timestamp: new Date(),
            };
            break;
          }
        }
        return updated;
      });
      setCurrentJobId(undefined);
    } else if (status === 'FAILED') {
      setState((prev) => ({ ...prev, isGenerating: false }));
      setGenerationRecords((prev) =>
        prev.map((r) => (r.status === 'generating' ? { ...r, status: 'failed' } : r))
      );
      setCurrentJobId(undefined);
    }
  }, [currentJobId, jobQuery.data, queryClient]);

  const handlePoseChange = useCallback((pose: SkeletonPose) => {
    setState((prev) => ({ ...prev, currentPose: pose }));
  }, []);

  const handleComplete = useCallback(() => {
    navigate(PATHS.HOME);
  }, [navigate]);

  // (보류 중) 텍스트 합성 로직은 서버 프록시/합성 채택 시 재사용 예정

  // 저장: 서버에서 바이너리 이미지를 가져와(동일 출처) 로컬 합성 후 업로드
  const handleSave = useCallback(async () => {
    if (!currentGroupId) {
      setIsTagDialogOpen(true);
      return;
    }
    try {
      await doComposeAndUpload(currentGroupId);
      // 저장 성공 후 텍스트 오버레이 초기화
      setState((prev) => ({ ...prev, textOverlays: [] }));
      setIsTagDialogOpen(true);
    } catch (e) {
      console.error('[handleSave] composeAndUploadPoster failed:', e);
      setIsTagDialogOpen(true);
    }
  }, [currentGroupId, doComposeAndUpload]);

  // 텍스트 관련 핸들러들
  const handleAddText = useCallback((textOverlay: TextOverlay) => {
    setState((prev) => ({
      ...prev,
      textOverlays: [...prev.textOverlays, textOverlay],
      step: "text-edit",
    }));
  }, []);

  const handleUpdateText = useCallback((id: string, updates: Partial<TextOverlay>) => {
    setState((prev) => ({
      ...prev,
      textOverlays: prev.textOverlays.map((text) =>
        text.id === id ? { ...text, ...updates } : text
      ),
    }));
  }, []);

  const handleRemoveText = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      textOverlays: prev.textOverlays.filter((text) => text.id !== id),
    }));
  }, []);

  const handleTextPositionChange = useCallback(
    (id: string, x: number, y: number) => {
      handleUpdateText(id, { x, y });
    },
    [handleUpdateText]
  );

  // 그룹 선택/신규
  const handleSelectGroup = useCallback((groupId: number) => {
    setCurrentGroupId(groupId);
    setIsGroupListOpen(false);
    setSelectedRecordId(undefined);
    setState((prev) => ({
      ...prev,
      step: 'edit',
      currentPose: prev.currentPose ?? defaultSkeletonPose,
    }));
  }, []);

  const handleNewGroup = useCallback(() => {
    setCurrentGroupId(undefined);
    setIsGroupListOpen(false);
    setGenerationRecords([]);
    setSelectedRecordId(undefined);
    setPersonImage(null);
    setProductImage(null);
    setSketchImage(null);
    setState({
      step: 'upload',
      uploadedImages: [],
      generatedPoster: null,
      currentPose: null,
      prompt: '',
      isGenerating: false,
      textOverlays: [],
      title: '',
      content: '',
    });
  }, []);

  // 현재 그룹 상세를 불러와 히스토리와 캔버스를 동기화
  const groupDetailQuery = usePosterGroupDetail(currentGroupId as number);

  React.useEffect(() => {
    const detail = groupDetailQuery.data;
    if (!detail) return;
    // 히스토리 변환: 서버 포스터 목록(history 또는 posters)을 UI 레코드로 맵핑
    const historyItems = (detail as any).history ?? (detail as any).posters ?? [];
    const mapped = historyItems.map((p: any, idx: number) => ({
      id: String(p.posterId ?? idx),
      timestamp: new Date(p.createdAt || new Date()),
      thumbnail: p.imgUrl,
      prompt: p.prompt ?? detail.title ?? `생성 ${idx + 1}`,
      step: 'generate' as const,
      status: 'completed' as const,
    }));
    // 최신 이미지로 캔버스 업데이트: history 마지막
    const last = historyItems.length > 0 ? historyItems[historyItems.length - 1] : undefined;
    setState((prev) => {
      // 그룹 동기화 시 초기 진입(upload)일 때만 'edit'로 전환하고 현재 단계를 보존
      const shouldInitializeToEdit = prev.step === 'upload';
      const nextStep = shouldInitializeToEdit ? 'edit' : prev.step;
      // eslint-disable-next-line no-console
      console.log('[groupSync] step preserved:', prev.step, '->', nextStep);

      return {
        ...prev,
        generatedPoster: last?.imgUrl ?? prev.generatedPoster,
        step: nextStep,
        currentPose: nextStep === 'text-edit' ? null : (prev.currentPose ?? defaultSkeletonPose),
      };
    });
    setGenerationRecords(mapped);
    setSelectedRecordId(undefined);
  }, [groupDetailQuery.data]);

  // 히스토리 선택에 따라 캔버스 이미지 동기화 (선택 없으면 마지막 항목)
  React.useEffect(() => {
    const selected = generationRecords.find((r) => r.id === selectedRecordId);
    const last = generationRecords.length > 0 ? generationRecords[generationRecords.length - 1] : undefined;
    if (!selected && !last) return;
    setState((prev) => ({
      ...prev,
      generatedPoster: selected?.thumbnail ?? last?.thumbnail ?? prev.generatedPoster,
    }));
  }, [selectedRecordId, generationRecords]);

  const handleSelectRecord = useCallback(
    (recordId: string) => {
      setSelectedRecordId(selectedRecordId === recordId ? undefined : recordId);
      // 선택된 기록으로 상태 복원
    },
    [selectedRecordId]
  );

  return (
    <div className='w-full h-screen bg-background overflow-hidden flex flex-col'>
      <StyleSelectionDialog
        isOpen={isStyleDialogOpen}
        onStyleSelect={(styleId) => {
          setUiStyle(styleId as UiPosterStyle);
          setIsStyleDialogOpen(false);
        }}
        onClose={() => setIsStyleDialogOpen(false)}
      />

      {/* Header - 최상단 고정 */}
      <PosterTopBar
        historyCount={generationRecords.length}
        onOpenHistory={() => {
          const event = new CustomEvent("openGenerationHistory");
          window.dispatchEvent(event);
        }}
      />

      {/* 생성 과정 히스토리 - 이벤트 기반으로 처리 */}
      <GenerationHistory
        records={generationRecords}
        onSelectRecord={handleSelectRecord}
        selectedRecordId={selectedRecordId}
      />

      {/* Body - Header 아래 전체 영역 */}
      <div className='flex-1 flex flex-row min-h-0 overflow-hidden'>
        {/* 그룹 목록 사이드바 */}
        <GroupList
          groups={groupsQuery.data ?? []}
          currentGroupId={currentGroupId}
          onSelectGroup={handleSelectGroup}
          onNewGroup={handleNewGroup}
          isOpen={isGroupListOpen}
          onToggle={() => setIsGroupListOpen(!isGroupListOpen)}
        />

        <div className='flex-1 flex flex-row min-h-0'>
          {/* 포스터 생성 영역 */}
          <div
            className='flex-1 flex flex-col p-4 lg:p-6 min-h-0 max-h-full'
            onClick={handleOutsideClick}
          >
            {/* 가운데: Canvas + 프롬프트 */}
            <main className='relative flex flex-col items-center w-full max-w-[500px] mx-auto flex-1 min-h-0'>
              <PosterCanvasView generatedPoster={state.generatedPoster} onOpenPreview={() => setIsImagePreviewOpen(true)} isGenerating={state.isGenerating} containerRef={posterContainerRef}>
                {/* 텍스트 오버레이들 */}
                {state.textOverlays.map((text) => (
                  <div
                    key={text.id}
                    className={`absolute select-none ${selectedTextId === text.id ? "ring-2 ring-primary ring-opacity-50" : ""}`}
                    data-overlay='text'
                    data-id={text.id}
                    style={{
                      left: `${text.x}%`,
                      top: `${text.y}%`,
                      width: text.width ? `${text.width}px` : 'auto',
                      transform: "translate(-50%, -50%)",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTextId(selectedTextId === text.id ? undefined : text.id);
                    }}
                  >
                    {/* 텍스트 내용 */}
                    <div
                      className="cursor-move break-words whitespace-pre-wrap"
                      style={{
                        fontSize: `${text.fontSize}px`,
                        color: text.color,
                        fontWeight: text.fontWeight,
                        fontFamily: text.fontFamily,
                        textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
                        lineHeight: "1.2",
                        textAlign: "center",
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        const host = posterContainerRef.current ?? e.currentTarget.parentElement!.parentElement!;
                        const rect = host.getBoundingClientRect();
                        // 이미지가 object-contain이므로 실제 표시 영역의 padding을 반영
                        const imgEl = host.querySelector('img');
                        let effectiveWidth = rect.width, effectiveHeight = rect.height;
                        if (imgEl) {
                          const imgRect = (imgEl as HTMLElement).getBoundingClientRect();
                          effectiveWidth = imgRect.width;
                          effectiveHeight = imgRect.height;
                        }
                        const startX = e.clientX;
                        const startY = e.clientY;
                        const startLeft = text.x;
                        const startTop = text.y;
                        const handleMouseMove = (e: MouseEvent) => {
                          const deltaX = ((e.clientX - startX) / effectiveWidth) * 100;
                          const deltaY = ((e.clientY - startY) / effectiveHeight) * 100;
                          const newX = Math.max(0, Math.min(100, startLeft + deltaX));
                          const newY = Math.max(0, Math.min(100, startTop + deltaY));
                          handleTextPositionChange(text.id, newX, newY);
                        };
                        const handleMouseUp = () => {
                          document.removeEventListener("mousemove", handleMouseMove);
                          document.removeEventListener("mouseup", handleMouseUp);
                        };
                        document.addEventListener("mousemove", handleMouseMove);
                        document.addEventListener("mouseup", handleMouseUp);
                      }}
                    >
                      {text.text}
                    </div>
                    
                    {/* 리사이즈 핸들 (선택된 텍스트에만 표시) */}
                    {selectedTextId === text.id && (
                      <>
                        {/* 우측 너비 조절 핸들 */}
                        <div
                          className="absolute top-1/2 -right-1 w-3 h-3 bg-primary border border-white rounded-full cursor-ew-resize shadow-sm transform -translate-y-1/2"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            const startX = e.clientX;
                            const startWidth = text.width || 200; // 기본 너비
                            
                            const handleMouseMove = (e: MouseEvent) => {
                              const deltaX = e.clientX - startX;
                              const newWidth = Math.max(50, Math.min(400, startWidth + deltaX)); // 최소 50px, 최대 400px
                              
                              setState((prev) => ({
                                ...prev,
                                textOverlays: prev.textOverlays.map((t) =>
                                  t.id === text.id ? { ...t, width: newWidth } : t
                                ),
                              }));
                            };
                            
                            const handleMouseUp = () => {
                              document.removeEventListener("mousemove", handleMouseMove);
                              document.removeEventListener("mouseup", handleMouseUp);
                            };
                            
                            document.addEventListener("mousemove", handleMouseMove);
                            document.addEventListener("mouseup", handleMouseUp);
                          }}
                        />
                      </>
                    )}
                  </div>
                ))}
              </PosterCanvasView>

              {/* 하단 프롬프트 영역 - 고정 위치 */}
              <div className='w-full flex-shrink-0 mt-4'>
                <div className='bg-background/80 backdrop-blur-xl rounded-xl border border-white/10 p-4 shadow-xl'>
                  <PromptInput
                    value={state.prompt}
                    onChange={(value) => setState((prev) => ({ ...prev, prompt: value }))}
                    onGenerate={handleGenerate}
                    isGenerating={state.isGenerating}
                    allowEmptyPrompt={!!state.generatedPoster}
                  />
                </div>
              </div>
            </main>
          </div>

          {/* 오른쪽: 통합 사이드바 */}
          <aside className={`${state.step === "edit" && state.currentPose ? "w-[400px] lg:w-[480px]" : "w-[300px] lg:w-[340px]"} border-l border-white/5 bg-background/50 backdrop-blur-xl overflow-y-auto scrollbar-hidden transition-all duration-300`} style={{ height: "100%" }}>
            <PosterSidebar
              step={state.step}
              currentPose={state.currentPose}
              isGenerating={state.isGenerating}
              textOverlays={state.textOverlays}
              selectedTextId={selectedTextId}
              onPoseChange={handlePoseChange}
              onBackToEdit={() => setState((prev) => ({ ...prev, step: "edit", currentPose: prev.currentPose ?? defaultSkeletonPose }))}
              onComplete={handleComplete}
              onSave={handleSave}
              onGenerateCopy={async () => {
                if (!currentPosterId) return;
                try {
                  setIsGeneratingCopy(true);
                  const res = await generatePosterCopy(currentPosterId);
                  const content = res.data?.content?.trim();
                  if (content) {
                    const newOverlay: TextOverlay = {
                      id: `text-${Date.now()}`,
                      text: content,
                      x: 50,
                      y: 50,
                      fontSize: 24,
                      color: "#FFFFFF",
                      fontWeight: "bold",
                      fontFamily: "The Jamsil 5 Bold",
                    };
                    setState((prev) => ({ ...prev, textOverlays: [...prev.textOverlays, newOverlay] }));
                  }
                } catch (e) {
                  // eslint-disable-next-line no-console
                  console.error('[onGenerateCopy] failed:', e);
                }
                finally { setIsGeneratingCopy(false); }
              }}
              isGeneratingCopy={isGeneratingCopy}
              onAddText={handleAddText}
              onUpdateText={handleUpdateText}
              onRemoveText={handleRemoveText}
              onSelectText={setSelectedTextId}
              skeletonRef={skeletonCanvasRef}
            />
            <div className='p-4 flex flex-col gap-4'>
              {!(state.step === 'text-edit' || (state.step === 'edit' && state.currentPose)) && (
                <div className='flex flex-col gap-4'>
                  {/* 파일 첨부 */}
                  <section
                    className='bg-background/50 rounded-xl border border-white/10 overflow-hidden flex-shrink-0'
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Accordion
                      title='파일 첨부하기'
                      isOpen={isFileAccordionOpen}
                      onToggle={(isOpen) => setIsFileAccordionOpen(isOpen)}
                    >
                      <UploadDropzone
                        onUpload={({ image }) => {
                          if (!image) return;
                          handleImageUpload(image);
                        }}
                        uploadedImages={{
                          person: personImage,
                          product: productImage,
                          sketch: sketchImage,
                        }}
                        onRemove={handleImageRemove}
                      />
                    </Accordion>
                  </section>

                  {/* 기본 정보 입력 */}
                  <section
                    className='flex flex-col gap-3 flex-shrink-0'
                    onClick={handleOutsideClick}
                  >
                    <div className='flex items-center gap-3 pb-3 border-b border-white/10'>
                      <div className='p-2 bg-primary/10 rounded-lg'>
                        <svg
                          className='w-4 h-4 text-primary'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                          />
                        </svg>
                      </div>
                      <h3 className='text-base font-bold text-text-color'>기본 정보</h3>
                    </div>
                    <div className='space-y-3'>
                      <input
                        type='text'
                        placeholder='포스터 제목'
                        value={state.title}
                        onChange={(e) => setState((prev) => ({ ...prev, title: e.target.value }))}
                        className='w-full rounded-lg bg-background/50 border border-primary/20 px-3 py-2 text-sm text-text-color placeholder-text-color/60 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all'
                      />
                      <textarea
                        placeholder='포스터 내용 (선택사항)'
                        value={state.content}
                        onChange={(e) => setState((prev) => ({ ...prev, content: e.target.value }))}
                        className='w-full h-16 resize-none rounded-lg bg-background/50 border border-primary/20 px-3 py-2 text-sm text-text-color placeholder-text-color/60 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all'
                        maxLength={200}
                      />
                      <div className='flex justify-end text-xs text-text-color/60'>
                        <span>{state.content.length} / 200</span>
                      </div>
                    </div>
                  </section>

                  {/* 현재 상태 - 아코디언이 닫혀있을 때만 표시 */}
                  {!isFileAccordionOpen && (
                    <section
                      className='flex flex-col gap-3 flex-shrink-0'
                      onClick={handleOutsideClick}
                    >
                      <div className='flex items-center gap-3 pb-3 border-b border-white/10'>
                        <div className='p-2 bg-primary/10 rounded-lg'>
                          <svg
                            className='w-4 h-4 text-primary'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                            />
                          </svg>
                        </div>
                        <h3 className='text-base font-bold text-text-color'>현재 상태</h3>
                      </div>
                      <div className='bg-background/30 rounded-xl p-4 space-y-3'>
                        <div className='flex items-center justify-between p-2 rounded-lg bg-background/50'>
                          <div className='flex items-center gap-3'>
                            <div
                              className={`w-3 h-3 rounded-full ${
                                state.title.trim() ? "bg-green-400 animate-pulse" : "bg-gray-400"
                              }`}
                            ></div>
                            <span className='text-sm font-medium'>제목</span>
                          </div>
                          <span className='text-xs text-text-color/60'>
                            {state.title.trim() ? "완료" : "대기중"}
                          </span>
                        </div>

                        <div className='flex items-center justify-between p-2 rounded-lg bg-background/50'>
                          <div className='flex items-center gap-3'>
                            <div
                              className={`w-3 h-3 rounded-full ${
                                state.content.trim() ? "bg-green-400 animate-pulse" : "bg-gray-400"
                              }`}
                            ></div>
                            <span className='text-sm font-medium'>내용</span>
                          </div>
                          <span className='text-xs text-text-color/60'>
                            {state.content.trim() ? "완료" : "선택사항"}
                          </span>
                        </div>

                        <div className='flex items-center justify-between p-2 rounded-lg bg-background/50'>
                          <div className='flex items-center gap-3'>
                            <div
                              className={`w-3 h-3 rounded-full ${
                                personImage ? "bg-green-400 animate-pulse" : "bg-gray-400"
                              }`}
                            ></div>
                            <span className='text-sm font-medium'>인물 사진</span>
                          </div>
                          <span className='text-xs text-text-color/60'>
                            {personImage ? "업로드됨" : "대기중"}
                          </span>
                        </div>

                        <div className='flex items-center justify-between p-2 rounded-lg bg-background/50'>
                          <div className='flex items-center gap-3'>
                            <div
                              className={`w-3 h-3 rounded-full ${
                                productImage ? "bg-green-400 animate-pulse" : "bg-gray-400"
                              }`}
                            ></div>
                            <span className='text-sm font-medium'>상품 사진</span>
                          </div>
                          <span className='text-xs text-text-color/60'>
                            {productImage ? "업로드됨" : "대기중"}
                          </span>
                        </div>

                        <div className='flex items-center justify-between p-2 rounded-lg bg-background/50'>
                          <div className='flex items-center gap-3'>
                            <div
                              className={`w-3 h-3 rounded-full ${
                                state.prompt.trim() ? "bg-green-400 animate-pulse" : "bg-gray-400"
                              }`}
                            ></div>
                            <span className='text-sm font-medium'>프롬프트</span>
                          </div>
                          <span className='text-xs text-text-color/60'>
                            {state.prompt.trim() ? "완료" : "대기중"}
                          </span>
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
          className='fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center transition-all duration-300 ease-out opacity-100'
          onClick={() => setIsImagePreviewOpen(false)}
        >
          <div
            className='relative rounded-2xl shadow-2xl transform transition-all duration-300 ease-out scale-100 translate-y-0 opacity-100'
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "95vw",
              maxHeight: "95vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={state.generatedPoster}
              alt='포스터 원본'
              className='max-w-full max-h-full object-contain rounded-2xl'
              style={{
                maxWidth: "95vw",
                maxHeight: "95vh",
                width: "auto",
                height: "auto",
              }}
            />

            {/* 안내 텍스트 */}
            <div className='absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm font-medium'>
              ESC 키나 배경 클릭으로 닫기
            </div>

            {/* 닫기 버튼 */}
            <button
              onClick={() => setIsImagePreviewOpen(false)}
              className='absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-black/90 transition-all'
            >
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          </div>
        </div>
      )}
      {/* 태그 지정 다이얼로그 */}
      {isTagDialogOpen && currentGroupId && (
        <TagDialog
          groupId={currentGroupId}
          onClose={() => setIsTagDialogOpen(false)}
          onSaved={() => handleNewGroup()}
        />)
      }
    </div>
  );
};

export default PosterPage;

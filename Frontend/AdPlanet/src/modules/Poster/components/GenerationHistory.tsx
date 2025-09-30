import React, { useState } from "react";
import type { GenerationRecord } from "../../../types/poster";

interface GenerationHistoryProps {
  records: GenerationRecord[];
  onSelectRecord: (recordId: string) => void;
  selectedRecordId?: string;
}

const GenerationHistory: React.FC<GenerationHistoryProps> = ({
  records,
  onSelectRecord,
  selectedRecordId,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [brokenThumbIds, setBrokenThumbIds] = useState<Set<string>>(new Set());

  // 헤더에서 오는 이벤트 리스너
  React.useEffect(() => {
    const handleOpenHistory = () => {
      setIsCollapsed(false);
    };

    const handleCloseHistory = () => {
      setIsCollapsed(true);
    };

    window.addEventListener("openGenerationHistory", handleOpenHistory);
    window.addEventListener("closeGenerationHistory", handleCloseHistory);
    
    return () => {
      window.removeEventListener("openGenerationHistory", handleOpenHistory);
      window.removeEventListener("closeGenerationHistory", handleCloseHistory);
    };
  }, []);
  const getStepLabel = (step: string) => {
    switch (step) {
      case "upload":
        return "업로드";
      case "generate":
        return "생성";
      case "edit":
        return "포즈 편집";
      case "text-edit":
        return "텍스트 편집";
      default:
        return step;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "generating":
        return (
          <div className='w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin'></div>
        );
      case "completed":
        return <div className='w-3 h-3 bg-green-500 rounded-full'></div>;
      case "failed":
        return <div className='w-3 h-3 bg-red-500 rounded-full'></div>;
      default:
        return null;
    }
  };

  if (records.length === 0) {
    return null;
  }

  return (
    <>
      {/* 다이얼로그 형태의 확장 영역 */}
      {!isCollapsed && (
        <div
          className='fixed inset-0 bg-black/20 backdrop-blur-sm z-40'
          onClick={() => setIsCollapsed(true)}
        >
          <div
            className='absolute top-20 left-1/2 transform -translate-x-1/2 w-[90vw] max-w-5xl bg-background/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='p-6'>
              <div className='flex items-center justify-between mb-6'>
                <div className='flex items-center gap-3'>
                  <div className='p-2 bg-primary/10 rounded-lg'>
                    <svg
                      className='w-5 h-5 text-primary'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className='text-lg font-bold text-text-color'>생성 히스토리</h3>
                    <p className='text-sm text-text-color/60'>{records.length}개의 단계</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsCollapsed(true)}
                  className='p-2 text-text-color/60 hover:text-text-color rounded-lg hover:bg-white/5 transition-all'
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

              <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 max-h-96 overflow-y-auto scrollbar-hidden p-4'>
                {records.map((record, index) => (
                  <button
                    key={record.id}
                    onClick={() => onSelectRecord(record.id)}
                    className='relative group transition-all duration-200 p-3 flex flex-col items-center'
                  >
                    {/* 선택 상태 표시 - 배경 */}
                    {selectedRecordId === record.id && (
                      <div className='absolute inset-0 bg-primary/10 rounded-xl border-2 border-primary/50'></div>
                    )}

                    {/* 썸네일 컨테이너 */}
                    <div className='relative'>
                      <div className='w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 shadow-lg group-hover:shadow-xl group-hover:border-primary/30 transition-all flex items-center justify-center'>
                        {record.thumbnail && !brokenThumbIds.has(record.id) ? (
                          <img
                            src={record.thumbnail}
                            alt={`생성 ${index + 1}`}
                            className='w-full h-full object-cover'
                            onError={() => {
                              setBrokenThumbIds((prev) => {
                                const next = new Set(prev);
                                next.add(record.id);
                                return next;
                              });
                            }}
                          />
                        ) : (
                          <div className='w-full h-full flex items-center justify-center text-primary/60'>
                            <svg className='w-8 h-8' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* 상태 아이콘 */}
                      <div className='absolute top-1 right-1 bg-background rounded-full p-1 shadow-lg border border-white/10'>
                        {getStatusIcon(record.status)}
                      </div>

                      {/* 단계 번호 - 썸네일 외부로 이동 */}
                      <div className='absolute -bottom-3 -left-3 bg-gradient-to-r from-primary to-primary/80 text-background text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg z-10'>
                        {index + 1}
                      </div>
                    </div>

                    {/* 단계 이름 - 중앙 정렬 */}
                    <div className='mt-4 text-xs text-text-color/80 font-medium text-center'>
                      {getStepLabel(record.step)}
                    </div>

                    {/* 시간 - 중앙 정렬 */}
                    <div className='text-xs text-text-color/60 mb-2 text-center'>
                      {record.timestamp.toLocaleTimeString("ko-KR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GenerationHistory;

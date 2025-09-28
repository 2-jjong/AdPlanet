import React from "react";
import type { PosterGroupItem } from "../../../services/dto/poster.response";

interface GroupListProps {
  groups: PosterGroupItem[];
  currentGroupId?: number;
  onSelectGroup: (groupId: number) => void;
  onNewGroup: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

const GroupList: React.FC<GroupListProps> = ({
  groups,
  currentGroupId,
  onSelectGroup,
  onNewGroup,
  isOpen,
  onToggle,
}) => {
  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "오늘";
    if (days === 1) return "어제";
    if (days < 7) return `${days}일 전`;
    return d.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
  };

  // 최신 생성일 순으로 정렬 (가장 최근이 위)
  const sortedGroups = React.useMemo(() => {
    return [...groups].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [groups]);

  return (
    <>
      {isOpen && <div className='fixed inset-0 bg-black/20 z-10 lg:hidden' onClick={onToggle} />}

      <div
        data-group-sidebar
        className={`relative z-20 bg-background/95 backdrop-blur-xl border-r border-white/10 transform transition-all duration-300 ease-in-out flex flex-col h-full ${
          isOpen ? "w-80 lg:w-72" : "w-16"
        } lg:bg-background`}
      >
        <div
          className={`flex items-center justify-between border-b border-white/5 transition-all ${
            isOpen ? "p-6" : "p-3 lg:flex-col lg:gap-2"
          }`}
        >
          {isOpen ? (
            <>
              <h2 className='text-xl font-bold text-text-color'>그룹</h2>
              <button onClick={onToggle} className='p-2 text-text-color/60 hover:text-text-color rounded-lg hover:bg-white/5 transition-all'>
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
                </svg>
              </button>
            </>
          ) : (
            <button onClick={onToggle} className='w-full p-2 text-text-color/60 hover:text-text-color rounded-lg hover:bg-white/5 transition-all flex items-center justify-center' title='그룹 열기'>
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
              </svg>
            </button>
          )}
        </div>

        {isOpen && (
          <div className='p-4'>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNewGroup();
              }}
              className='w-full flex items-center gap-3 p-4 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl text-primary hover:from-primary/20 hover:to-primary/10 hover:border-primary/30 transition-all duration-200 group'
            >
              <div className='p-1 bg-primary/20 rounded-lg group-hover:bg-primary/30 transition-colors'>
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
                </svg>
              </div>
              <span className='font-medium'>새 포스터 만들기</span>
            </button>
          </div>
        )}

        <div className='flex-1 min-h-0 overflow-y-auto scrollbar-hidden'>
          {isOpen ? (
            sortedGroups.length === 0 ? (
              <div className='p-8 text-center text-text-color/60'>
                <div className='w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center'>
                  <svg className='w-8 h-8 text-primary/60' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' />
                  </svg>
                </div>
                <p className='text-sm font-medium mb-1'>아직 그룹이 없습니다</p>
                <p className='text-xs text-text-color/40'>새 포스터를 만들어 시작해보세요</p>
              </div>
            ) : (
              <div className='p-3 space-y-2'>
                {sortedGroups.map((g) => {
                  const thumb = (g as any).imgUrl ?? (g as any).imageUrl;
                  return (
                  <button
                    key={g.posterGroupId}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectGroup(g.posterGroupId);
                    }}
                    className={`w-full block p-3 rounded-xl text-left transition-all duration-200 group ${
                      currentGroupId === g.posterGroupId
                        ? "bg-gradient-to-r from-primary/15 to-primary/5 border border-primary/30 shadow-lg shadow-primary/10"
                        : "hover:bg-white/5 hover:border hover:border-white/10"
                    }`}
                  >
                    <div className='flex items-start gap-4'>
                      <div className='w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex-shrink-0 overflow-hidden group-hover:border-primary/30 transition-colors'>
                        {thumb ? (
                          <img src={thumb} alt={g.title} className='w-full h-full object-cover' />
                        ) : (
                          <div className='w-full h-full flex items-center justify-center text-primary/60'>
                            <svg className='w-7 h-7' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <h3 className='text-sm font-semibold text-text-color truncate'>{g.title || '제목 없음'}</h3>
                        <p className='text-xs text-text-color/60 mt-1'>{formatDate(g.createdAt)}</p>
                      </div>
                    </div>
                  </button>
                );})}
              </div>
            )
          ) : (
            <div className='flex flex-col p-2 space-y-2'>
              {sortedGroups.slice(0, 6).map((g) => {
                const thumb = (g as any).imgUrl ?? (g as any).imageUrl;
                return (
                <button
                  key={g.posterGroupId}
                  onClick={() => onSelectGroup(g.posterGroupId)}
                  className={`relative w-12 h-12 rounded-xl transition-all duration-200 group ${
                    currentGroupId === g.posterGroupId
                      ? "bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30"
                      : "bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 hover:border-primary/30"
                  }`}
                  title={g.title}
                >
                  {thumb ? (
                    <img src={thumb} alt={g.title} className='w-full h-full object-cover rounded-xl' />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center text-primary/60'>
                      <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' />
                      </svg>
                    </div>
                  )}
                </button>
              );})}
              {sortedGroups.length > 6 && (
                <div className='w-12 h-8 rounded-lg bg-primary/5 border border-primary/20 flex items-center justify-center text-xs text-primary/60'>
                  +{sortedGroups.length - 6}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default GroupList;



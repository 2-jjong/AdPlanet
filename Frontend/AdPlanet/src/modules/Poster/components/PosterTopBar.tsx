import React from "react";
import { Button } from "../../../components/UI/Button/Button";
import Header from "../../../components/Layout/Header";

interface PosterTopBarProps {
  historyCount: number;
  onOpenHistory: () => void;
}

const PosterTopBar: React.FC<PosterTopBarProps> = ({ historyCount, onOpenHistory }) => {
  return (
    <header className='flex items-center justify-between p-6 border-b border-white/5 flex-shrink-0 bg-background/50 backdrop-blur-xl relative z-40'>
      <div className='flex items-center'>
        <Header />
      </div>

      <div className='flex items-center gap-2 bg-background/30 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10'>
        <div className='p-1.5 bg-primary/10 rounded-lg'>
          <svg
            className='w-3.5 h-3.5 text-primary'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
          </svg>
        </div>
        <div>
          <h3 className='text-sm font-semibold text-text-color'>생성 히스토리</h3>
          <p className='text-xs text-text-color/60'>{historyCount}개의 단계</p>
        </div>
        <button
          onClick={onOpenHistory}
          className='p-2 text-text-color/60 hover:text-text-color hover:bg-white/5 rounded-lg transition-all ml-2'
        >
          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
          </svg>
        </button>
      </div>

      <div className='flex items-center gap-3'>
        <Button text='내보내기' variant='outline' size='xs' />
        <Button text='아카이브' variant='outline' size='xs' />
        <div className='w-8 h-8 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full flex items-center justify-center'>
          <div className='w-2 h-2 bg-primary rounded-full'></div>
        </div>
      </div>
    </header>
  );
};

export default PosterTopBar;



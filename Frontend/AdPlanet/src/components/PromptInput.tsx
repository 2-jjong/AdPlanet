import React, { useState } from 'react';

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  maxLength?: number;
}

const PromptInput: React.FC<PromptInputProps> = ({
  value,
  onChange,
  onGenerate,
  isGenerating,
  maxLength = 500
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !isGenerating) {
      onGenerate();
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-text-color text-sm font-medium">상세 프롬프트</h3>
        <span className="text-text-color text-xs opacity-70">
          {value.length}/{maxLength}
        </span>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="원하는 포스터의 구도, 스타일, 분위기를 자세히 설명해주세요."
            className={`w-full bg-transparent border border-primary rounded-md px-3 py-2 text-text-color placeholder-text-color/60 resize-none transition-all ${
              isExpanded ? 'h-32' : 'h-20'
            } focus:border-primary focus:outline-none`}
            maxLength={maxLength}
            onFocus={() => setIsExpanded(true)}
            onBlur={() => setIsExpanded(false)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="p-2 text-text-color/60 hover:text-primary transition-colors"
              title="프롬프트 편집"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
          
          <button
            type="submit"
            disabled={!value.trim() || isGenerating}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${
              !value.trim() || isGenerating
                ? 'bg-transparent border border-primary/30 text-primary/50 cursor-not-allowed'
                : 'bg-primary text-background hover:bg-primary/90'
            }`}
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                생성 중...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                포스터 생성
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PromptInput;

import React, { useState, useCallback } from "react";
import type { TextOverlay } from "../../../types/poster";

interface TextEditorProps {
  textOverlays: TextOverlay[];
  onAddText: (text: TextOverlay) => void;
  onUpdateText: (id: string, updates: Partial<TextOverlay>) => void;
  onRemoveText: (id: string) => void;
  selectedTextId?: string;
  onSelectText: (id: string | undefined) => void;
}

const TextEditor: React.FC<TextEditorProps> = ({
  textOverlays,
  onAddText,
  onUpdateText,
  onRemoveText,
  selectedTextId,
  onSelectText,
}) => {
  const [newText, setNewText] = useState("");

  const fontOptions: Array<{ label: string; value: string }> = [
    { label: "서비스 기본 (The Jamsil)", value: "The Jamsil 5 Bold" },
    { label: "Pretendard", value: "Pretendard, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Apple SD Gothic Neo, Noto Sans KR, Malgun Gothic, sans-serif" },
    { label: "Noto Sans KR", value: '"Noto Sans KR", sans-serif' },
    { label: "Nanum Myeongjo", value: '"Nanum Myeongjo", serif' },
    { label: "Arial", value: "Arial, Helvetica, sans-serif" },
    { label: "Times New Roman", value: '"Times New Roman", Times, serif' },
  ];

  const handleAddText = useCallback(() => {
    if (!newText.trim()) return;

    const textOverlay: TextOverlay = {
      id: `text-${Date.now()}`,
      text: newText.trim(),
      x: 50, // 기본 위치 (%)
      y: 50,
      fontSize: 24,
      color: "#FFFFFF",
      fontWeight: "bold",
      fontFamily: "The Jamsil 5 Bold",
    };

    onAddText(textOverlay);
    setNewText("");
  }, [newText, onAddText]);

  const selectedText = textOverlays.find((t) => t.id === selectedTextId);

  return (
    <div className='space-y-4'>
      {/* 텍스트 추가 */}
      <div className='space-y-2'>
        <h4 className='text-sm font-medium text-text-color'>광고 문구 추가</h4>
        <div className='space-y-2'>
          <textarea
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder='광고 문구를 입력하세요&#10;(Shift+Enter로 줄바꿈)'
            className='w-full px-3 py-2 bg-transparent border border-primary/40 rounded-md text-sm text-text-color placeholder-text-color/60 focus:border-primary focus:outline-none resize-none'
            rows={3}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAddText();
              }
            }}
          />
          <button
            onClick={handleAddText}
            disabled={!newText.trim()}
            className='w-full px-3 py-2 bg-primary text-background rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors'
          >
            추가
          </button>
        </div>
      </div>

      {/* 기존 텍스트 목록 */}
      {textOverlays.length > 0 && (
        <div className='space-y-2'>
          <h4 className='text-sm font-medium text-text-color'>추가된 문구</h4>
          <div className='space-y-2 max-h-32 overflow-y-auto'>
            {textOverlays.map((text) => (
              <div
                key={text.id}
                className={`p-2 rounded-md border cursor-pointer transition-colors ${
                  selectedTextId === text.id
                    ? "border-primary bg-primary/10"
                    : "border-primary/20 hover:border-primary/40"
                }`}
                onClick={() => onSelectText(selectedTextId === text.id ? undefined : text.id)}
              >
                <div className='flex items-start justify-between'>
                  <span className='text-xs text-text-color flex-1 whitespace-pre-wrap break-words'>{text.text}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveText(text.id);
                      if (selectedTextId === text.id) {
                        onSelectText(undefined);
                      }
                    }}
                    className='ml-2 p-1 text-red-400 hover:text-red-300 transition-colors flex-shrink-0'
                  >
                    <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
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
            ))}
          </div>
        </div>
      )}

      {/* 선택된 텍스트 편집 */}
      {selectedText && (
        <div className='space-y-3 p-3 border border-primary/30 rounded-md'>
          <h4 className='text-sm font-medium text-text-color'>텍스트 편집</h4>

          {/* 텍스트 내용 */}
          <div>
            <label className='block text-xs text-text-color/80 mb-1'>내용</label>
            <textarea
              value={selectedText.text}
              onChange={(e) => onUpdateText(selectedText.id, { text: e.target.value })}
              className='w-full px-2 py-1 bg-transparent border border-primary/40 rounded text-xs text-text-color focus:border-primary focus:outline-none resize-none'
              rows={2}
              placeholder='Shift+Enter로 줄바꿈'
            />
          </div>

          {/* 폰트 크기 */}
          <div>
            <label className='block text-xs text-text-color/80 mb-1'>
              크기: {selectedText.fontSize}px
            </label>
            <input
              type='range'
              min='12'
              max='48'
              value={selectedText.fontSize}
              onChange={(e) =>
                onUpdateText(selectedText.id, { fontSize: parseInt(e.target.value) })
              }
              className='w-full'
            />
          </div>

          {/* 텍스트 색상 */}
          <div>
            <label className='block text-xs text-text-color/80 mb-1'>색상</label>
            <div className='flex gap-2'>
              {["#FFFFFF", "#000000", "#FF0000", "#00FF00", "#0000FF", "#FFFF00"].map((color) => (
                <button
                  key={color}
                  onClick={() => onUpdateText(selectedText.id, { color })}
                  className={`w-6 h-6 rounded border-2 ${
                    selectedText.color === color ? "border-primary" : "border-gray-400"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* 폰트 굵기 */}
          <div>
            <label className='block text-xs text-text-color/80 mb-1'>굵기</label>
            <div className='flex gap-2'>
              <button
                onClick={() => onUpdateText(selectedText.id, { fontWeight: "normal" })}
                className={`px-2 py-1 text-xs rounded border ${
                  selectedText.fontWeight === "normal"
                    ? "border-primary bg-primary text-background"
                    : "border-primary/40 text-text-color"
                }`}
              >
                보통
              </button>
              <button
                onClick={() => onUpdateText(selectedText.id, { fontWeight: "bold" })}
                className={`px-2 py-1 text-xs rounded border ${
                  selectedText.fontWeight === "bold"
                    ? "border-primary bg-primary text-background"
                    : "border-primary/40 text-text-color"
                }`}
              >
                굵게
              </button>
            </div>
          </div>

          {/* 글꼴 선택 */}
          <div>
            <label className='block text-xs text-text-color/80 mb-1'>글꼴</label>
            <select
              value={selectedText.fontFamily}
              onChange={(e) => onUpdateText(selectedText.id, { fontFamily: e.target.value })}
              className='w-full px-2 py-1 bg-transparent border border-primary/40 rounded text-xs text-text-color focus:border-primary focus:outline-none'
            >
              {fontOptions.map((opt) => (
                <option key={opt.label} value={opt.value} className='bg-background'>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextEditor;

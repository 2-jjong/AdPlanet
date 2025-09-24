import React from "react";
import type { TextOverlay } from "../../../types/poster";

interface TextOverlayItemProps {
  text: TextOverlay;
  isSelected: boolean;
  onTextClick: (e: React.MouseEvent, textId: string) => void;
  onTextDragStart: (e: React.MouseEvent, textId: string, currentX: number, currentY: number) => void;
  onResizeStart: (e: React.MouseEvent, textId: string, startWidth: number) => void;
}

const TextOverlayItem: React.FC<TextOverlayItemProps> = ({
  text,
  isSelected,
  onTextClick,
  onTextDragStart,
  onResizeStart,
}) => {
  return (
    <div
      className={`absolute select-none ${isSelected ? "ring-2 ring-primary ring-opacity-50" : ""}`}
      data-overlay='text'
      data-id={text.id}
      style={{
        left: `${text.x}%`,
        top: `${text.y}%`,
        width: text.width ? `${text.width}px` : 'auto',
        transform: "translate(-50%, -50%)",
      }}
      onClick={(e) => onTextClick(e, text.id)}
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
        onMouseDown={(e) => onTextDragStart(e, text.id, text.x, text.y)}
      >
        {text.text}
      </div>
      
      {/* 리사이즈 핸들 (선택된 텍스트에만 표시) */}
      {isSelected && (
        <div
          className="absolute top-1/2 -right-1 w-3 h-3 bg-primary border border-white rounded-full cursor-ew-resize shadow-sm transform -translate-y-1/2"
          onMouseDown={(e) => onResizeStart(e, text.id, text.width || 200)}
        />
      )}
    </div>
  );
};

export default TextOverlayItem;

import React, { useState } from "react";
import { Button } from "../../../components/UI/Button/Button";

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onDownload: (ext: string) => void;
}

const extensions = ["png", "jpg", "svg"];

const DownloadModal: React.FC<DownloadModalProps> = ({
  isOpen,
  onClose,
  onDownload,
  imageUrl,
}) => {
  const [selectedExt, setSelectedExt] = useState<string>("PNG");

  const handleDownload = () => {
    onDownload(selectedExt);
    onClose();
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 text-white rounded-xl shadow-xl p-6 w-[520px] relative">
        {/* 닫기 버튼 */}
        <button className="absolute top-3 right-3 text-xl" onClick={onClose}>
          ✕
        </button>

        {/* 이미지 미리보기 */}
        <div className="flex justify-center items-center bg-gray-700 rounded-lg h-[320px]">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="preview"
              className="max-h-full max-w-full object-contain rounded-md"
            />
          ) : (
            <p className="opacity-60">이미지가 없습니다.</p>
          )}
        </div>

        {/* 확장자 선택 + 다운로드 버튼 */}
        <div className="mt-6 flex justify-between items-center">
          <select
            className="bg-gray-900 border border-white/20 px-3 py-1 rounded-md"
            value={selectedExt}
            onChange={(e) => setSelectedExt(e.target.value)}
          >
            {extensions.map((ext) => (
              <option key={ext} value={ext}>
                .{ext}
              </option>
            ))}
          </select>

          <Button
            text="저장하기"
            size="sm"
            variant="fill"
            onClick={handleDownload}
          />
        </div>
      </div>
    </div>
  );
};

export default DownloadModal;

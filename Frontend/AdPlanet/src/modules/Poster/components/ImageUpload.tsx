import React, { useCallback, useState } from "react";
import LogoClean from "../assets/clean.png";
import LogoPunk from "../assets/punk.png";
import LogoCartoon from "../assets/cartoon.png";
import LogoMono from "../assets/mono.png";
import type { UploadedImage } from "../../../types/poster";

interface ImageUploadProps {
  type: "person" | "product" | "sketch";
  onImageUpload: (image: UploadedImage) => void;
  onImageRemove: (id: string) => void;
  uploadedImage: UploadedImage | null;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  type,
  onImageUpload,
  onImageRemove,
  uploadedImage,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const getTypeLabel = () => {
    switch (type) {
      case "person":
        return "인물 사진";
      case "product":
        return "상품 사진";
      case "sketch":
        return "스케치 사진";
      default:
        return "이미지";
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case "person":
        return LogoClean;
      case "product":
        return LogoPunk;
      case "sketch":
        return LogoCartoon;
      default:
        return LogoMono;
    }
  };

  const handleFileSelect = useCallback(
    (file: File) => {
      if (file && file.type.startsWith("image/")) {
        const id = `${type}-${Date.now()}`;
        const preview = URL.createObjectURL(file);
        onImageUpload({ id, file, preview, type });
      }
    },
    [type, onImageUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleRemove = useCallback(() => {
    if (uploadedImage) {
      URL.revokeObjectURL(uploadedImage.preview);
      onImageRemove(uploadedImage.id);
    }
  }, [uploadedImage, onImageRemove]);

  return (
    <div className='w-full'>
      {/* 드롭다운 헤더 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className='w-full flex items-center justify-between p-3 bg-transparent border border-primary/30 rounded-lg hover:border-primary transition-colors'
      >
        <div className='flex items-center gap-3'>
          <img src={getTypeIcon()} alt={getTypeLabel()} className='w-6 h-6 object-cover rounded' />
          <span className='text-text-color font-medium'>{getTypeLabel()}</span>
          {uploadedImage && <div className='w-2 h-2 bg-green-500 rounded-full'></div>}
        </div>
        <svg
          className={`w-4 h-4 text-text-color transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
        </svg>
      </button>

      {/* 드롭다운 컨텐츠 */}
      {isExpanded && (
        <div className='mt-2 p-3 bg-transparent border border-primary/20 rounded-lg'>
          {uploadedImage ? (
            <div className='relative group'>
              <div className='w-full h-32 bg-transparent rounded-lg border-2 border-dashed border-primary/50 overflow-hidden'>
                <img
                  src={uploadedImage.preview}
                  alt={getTypeLabel()}
                  className='w-full h-full object-cover rounded-lg'
                />
              </div>
              <button
                onClick={handleRemove}
                className='absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity'
              >
                ×
              </button>
            </div>
          ) : (
            <div
              className={`w-full h-32 bg-transparent rounded-lg border-2 border-dashed transition-colors cursor-pointer ${
                isDragOver
                  ? "border-primary bg-primary/10"
                  : "border-primary/50 hover:border-primary"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => document.getElementById(`file-input-${type}`)?.click()}
            >
              <div className='w-full h-full flex flex-col items-center justify-center text-text-color opacity-60'>
                <div className='text-xs text-center px-4'>
                  {getTypeLabel()}을<br />
                  드래그하여 첨부해 주세요
                </div>
              </div>
              <input
                id={`file-input-${type}`}
                type='file'
                accept='image/*'
                onChange={handleFileInput}
                className='hidden'
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;

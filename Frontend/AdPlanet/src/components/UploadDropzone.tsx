import React, { useCallback, useState } from 'react';
import type { UploadedImage } from '../types/poster';

interface UploadDropzoneProps {
  onUpload: (payload: { type: 'person' | 'product' | 'sketch'; image: UploadedImage | null }) => void;
  uploadedImages?: {
    person: UploadedImage | null;
    product: UploadedImage | null;
    sketch: UploadedImage | null;
  };
  onRemove?: (type: 'person' | 'product' | 'sketch') => void;
}

const UploadDropzone: React.FC<UploadDropzoneProps> = ({ onUpload, uploadedImages, onRemove }) => {
  const [selectedType, setSelectedType] = useState<'person' | 'product' | 'sketch'>('person');
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    const id = `${selectedType}-${Date.now()}`;
    const preview = URL.createObjectURL(file);
    onUpload({ type: selectedType, image: { id, file, preview, type: selectedType } });
  }, [onUpload, selectedType]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files[0]) handleFile(files[0]);
  }, [handleFile]);

  const currentImage = uploadedImages?.[selectedType];

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(['person','product','sketch'] as const).map(t => (
          <button
            key={t}
            onClick={() => setSelectedType(t)}
            className={`px-3 py-1 rounded-md text-sm border relative ${selectedType===t? 'bg-primary text-background border-primary':'border-primary/40 text-text-color hover:border-primary'}`}
          >
            {t==='person'?'인물':t==='product'?'상품':'스케치'}
            {uploadedImages?.[t] && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
            )}
          </button>
        ))}
      </div>

      <div
        onDrop={onDrop}
        onDragOver={(e) => {e.preventDefault(); setIsDragOver(true);}}
        onDragLeave={() => setIsDragOver(false)}
        onClick={() => !currentImage && document.getElementById('poster-upload-input')?.click()}
        className={`h-56 rounded-2xl border-2 border-dashed flex items-center justify-center transition ${
          currentImage 
            ? 'border-primary/40' 
            : isDragOver 
              ? 'border-primary bg-primary/10 cursor-pointer' 
              : 'border-primary/40 hover:border-primary cursor-pointer'
        }`}
      >
        {currentImage ? (
          <div className="relative w-full h-full p-2">
            <img 
              src={currentImage.preview} 
              alt={`${selectedType} preview`}
              className="w-full h-full object-cover rounded-xl"
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  document.getElementById('poster-upload-input')?.click();
                }}
                className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                title="다른 이미지로 교체"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </button>
              {onRemove && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(selectedType);
                  }}
                  className="p-2 bg-red-500/80 text-white rounded-full hover:bg-red-500 transition-colors"
                  title="이미지 제거"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <div className="absolute bottom-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-xs">
              {selectedType==='person'?'인물':selectedType==='product'?'상품':'스케치'}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-4xl mb-3">📁</div>
            <p className="text-text-color/80 text-sm">
              {selectedType==='person'?'인물':selectedType==='product'?'상품':'스케치'} 사진을 드래그하거나 클릭하여 첨부하세요.
            </p>
          </div>
        )}
        <input 
          id="poster-upload-input" 
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={(e)=>{const f=e.target.files?.[0]; if(f) handleFile(f);}} 
        />
      </div>
    </div>
  );
}

export default UploadDropzone;



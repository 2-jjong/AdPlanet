import React, { useCallback, useState } from 'react';
import type { UploadedImage } from '../types/poster';

interface UploadDropzoneProps {
  onUpload: (payload: { type: 'person' | 'product' | 'sketch'; image: UploadedImage | null }) => void;
}

const UploadDropzone: React.FC<UploadDropzoneProps> = ({ onUpload }) => {
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

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(['person','product','sketch'] as const).map(t => (
          <button
            key={t}
            onClick={() => setSelectedType(t)}
            className={`px-3 py-1 rounded-md text-sm border ${selectedType===t? 'bg-primary text-background border-primary':'border-primary/40 text-text-color hover:border-primary'}`}
          >
            {t==='person'?'인물':t==='product'?'상품':'스케치'}
          </button>
        ))}
      </div>

      <div
        onDrop={onDrop}
        onDragOver={(e) => {e.preventDefault(); setIsDragOver(true);}}
        onDragLeave={() => setIsDragOver(false)}
        onClick={() => document.getElementById('poster-upload-input')?.click()}
        className={`h-56 rounded-2xl border-2 border-dashed flex items-center justify-center cursor-pointer transition ${isDragOver ? 'border-primary bg-primary/10' : 'border-primary/40 hover:border-primary'}`}
      >
        <div className="text-center">
          <p className="text-text-color/80 text-sm">{selectedType==='person'?'인물':selectedType==='product'?'상품':'스케치'} 사진을 드래그하거나 클릭하여 첨부하세요.</p>
        </div>
        <input id="poster-upload-input" type="file" accept="image/*" className="hidden" onChange={(e)=>{const f=e.target.files?.[0]; if(f) handleFile(f);}} />
      </div>
    </div>
  );
}

export default UploadDropzone;



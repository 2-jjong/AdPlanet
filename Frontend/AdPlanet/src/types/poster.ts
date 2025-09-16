// 포스터 생성 관련 타입 정의

export interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  type: 'person' | 'product' | 'sketch';
}

export interface SkeletonPoint {
  id: string;
  x: number;
  y: number;
  name: string;
  color: string;
}

export interface SkeletonPose {
  points: SkeletonPoint[];
  connections: Array<{
    from: string;
    to: string;
    color: string;
  }>;
}

export interface PosterGenerationState {
  step: 'upload' | 'generate' | 'edit' | 'complete';
  uploadedImages: UploadedImage[];
  generatedPoster: string | null;
  currentPose: SkeletonPose | null;
  prompt: string;
  isGenerating: boolean;
}

export interface PosterConfig {
  style: 'clean' | 'punk' | 'cartoon' | 'monochrome';
  composition: string;
  atmosphere: string;
}

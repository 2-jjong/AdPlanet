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

export interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontWeight: 'normal' | 'bold';
  fontFamily: string;
}

export interface PosterGenerationState {
  step: 'upload' | 'generate' | 'edit' | 'text-edit' | 'complete';
  uploadedImages: UploadedImage[];
  generatedPoster: string | null;
  currentPose: SkeletonPose | null;
  prompt: string;
  isGenerating: boolean;
  textOverlays: TextOverlay[];
  title: string;
  content: string;
}

export interface PosterConfig {
  style: 'clean' | 'punk' | 'cartoon' | 'monochrome';
  composition: string;
  atmosphere: string;
}

export interface GenerationRecord {
  id: string;
  timestamp: Date;
  thumbnail: string;
  prompt: string;
  step: 'upload' | 'generate' | 'edit' | 'text-edit';
  status: 'generating' | 'completed' | 'failed';
}

export interface ChatRoom {
  id: string;
  title: string;
  lastUpdated: Date;
  thumbnail?: string;
  messageCount: number;
  isActive: boolean;
}

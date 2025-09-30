import type { SkeletonPose } from '../../../types/poster';

export const defaultSkeletonPose: SkeletonPose = {
  points: [
    { id: 'head', x: 175, y: 80, name: '머리', color: '#8B5CF6' },
    { id: 'neck', x: 175, y: 120, name: '목', color: '#A855F7' },
    { id: 'chest', x: 175, y: 160, name: '가슴', color: '#3B82F6' },
    { id: 'waist', x: 175, y: 220, name: '허리', color: '#10B981' },
    { id: 'left_shoulder', x: 135, y: 140, name: '왼쪽 어깨', color: '#10B981' },
    { id: 'left_elbow', x: 95, y: 180, name: '왼쪽 팔꿈치', color: '#06B6D4' },
    { id: 'left_wrist', x: 75, y: 220, name: '왼쪽 손목', color: '#059669' },
    { id: 'right_shoulder', x: 215, y: 140, name: '오른쪽 어깨', color: '#F59E0B' },
    { id: 'right_elbow', x: 255, y: 180, name: '오른쪽 팔꿈치', color: '#EAB308' },
    { id: 'right_wrist', x: 275, y: 220, name: '오른쪽 손목', color: '#84CC16' },
    { id: 'left_hip', x: 155, y: 280, name: '왼쪽 엉덩이', color: '#06B6D4' },
    { id: 'left_knee', x: 145, y: 380, name: '왼쪽 무릎', color: '#3B82F6' },
    { id: 'left_ankle', x: 135, y: 460, name: '왼쪽 발목', color: '#8B5CF6' },
    { id: 'right_hip', x: 195, y: 280, name: '오른쪽 엉덩이', color: '#10B981' },
    { id: 'right_knee', x: 205, y: 380, name: '오른쪽 무릎', color: '#3B82F6' },
    { id: 'right_ankle', x: 215, y: 460, name: '오른쪽 발목', color: '#8B5CF6' },
  ],
  connections: [
    { from: 'head', to: 'neck', color: '#8B5CF6' },
    { from: 'neck', to: 'chest', color: '#3B82F6' },
    { from: 'chest', to: 'waist', color: '#10B981' },
    { from: 'chest', to: 'left_shoulder', color: '#10B981' },
    { from: 'left_shoulder', to: 'left_elbow', color: '#06B6D4' },
    { from: 'left_elbow', to: 'left_wrist', color: '#059669' },
    { from: 'chest', to: 'right_shoulder', color: '#F59E0B' },
    { from: 'right_shoulder', to: 'right_elbow', color: '#EAB308' },
    { from: 'right_elbow', to: 'right_wrist', color: '#84CC16' },
    { from: 'waist', to: 'left_hip', color: '#06B6D4' },
    { from: 'left_hip', to: 'left_knee', color: '#3B82F6' },
    { from: 'left_knee', to: 'left_ankle', color: '#8B5CF6' },
    { from: 'waist', to: 'right_hip', color: '#10B981' },
    { from: 'right_hip', to: 'right_knee', color: '#3B82F6' },
    { from: 'right_knee', to: 'right_ankle', color: '#8B5CF6' },
  ],
};



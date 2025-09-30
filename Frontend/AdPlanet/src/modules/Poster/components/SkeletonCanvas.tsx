import React, { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from "react";
import type { SkeletonPoint, SkeletonPose } from "../../../types/poster";
interface SkeletonCanvasProps {
  pose: SkeletonPose;
  onPoseChange: (pose: SkeletonPose) => void;
  width?: number;
  height?: number;
}

export interface SkeletonCanvasHandle {
  /** 현재 스켈레톤 캔버스를 PNG Blob으로 반환 */
  toBlob: () => Promise<Blob>;
}

function SkeletonCanvasImpl({
  pose,
  onPoseChange,
  width = 350,
  height = 500,
}: SkeletonCanvasProps, ref: React.Ref<SkeletonCanvasHandle>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // 기본 스켈레톤 포즈 생성
  const createDefaultPose = useCallback((): SkeletonPose => {
    const centerX = width / 2;
    const points: SkeletonPoint[] = [
      // 머리
      { id: "head", x: centerX, y: 80, name: "머리", color: "#8B5CF6" },
      { id: "neck", x: centerX, y: 120, name: "목", color: "#A855F7" },

      // 몸통
      { id: "chest", x: centerX, y: 160, name: "가슴", color: "#3B82F6" },
      { id: "waist", x: centerX, y: 220, name: "허리", color: "#10B981" },

      // 팔
      { id: "left_shoulder", x: centerX - 40, y: 140, name: "왼쪽 어깨", color: "#10B981" },
      { id: "left_elbow", x: centerX - 80, y: 180, name: "왼쪽 팔꿈치", color: "#06B6D4" },
      { id: "left_wrist", x: centerX - 100, y: 220, name: "왼쪽 손목", color: "#059669" },

      { id: "right_shoulder", x: centerX + 40, y: 140, name: "오른쪽 어깨", color: "#F59E0B" },
      { id: "right_elbow", x: centerX + 80, y: 180, name: "오른쪽 팔꿈치", color: "#EAB308" },
      { id: "right_wrist", x: centerX + 100, y: 220, name: "오른쪽 손목", color: "#84CC16" },

      // 다리
      { id: "left_hip", x: centerX - 20, y: 280, name: "왼쪽 엉덩이", color: "#06B6D4" },
      { id: "left_knee", x: centerX - 30, y: 380, name: "왼쪽 무릎", color: "#3B82F6" },
      { id: "left_ankle", x: centerX - 40, y: 460, name: "왼쪽 발목", color: "#8B5CF6" },

      { id: "right_hip", x: centerX + 20, y: 280, name: "오른쪽 엉덩이", color: "#10B981" },
      { id: "right_knee", x: centerX + 30, y: 380, name: "오른쪽 무릎", color: "#3B82F6" },
      { id: "right_ankle", x: centerX + 40, y: 460, name: "오른쪽 발목", color: "#8B5CF6" },
    ];

    const connections = [
      // 머리-목-가슴
      { from: "head", to: "neck", color: "#8B5CF6" },
      { from: "neck", to: "chest", color: "#3B82F6" },
      { from: "chest", to: "waist", color: "#10B981" },

      // 왼쪽 팔
      { from: "chest", to: "left_shoulder", color: "#10B981" },
      { from: "left_shoulder", to: "left_elbow", color: "#06B6D4" },
      { from: "left_elbow", to: "left_wrist", color: "#059669" },

      // 오른쪽 팔
      { from: "chest", to: "right_shoulder", color: "#F59E0B" },
      { from: "right_shoulder", to: "right_elbow", color: "#EAB308" },
      { from: "right_elbow", to: "right_wrist", color: "#84CC16" },

      // 왼쪽 다리
      { from: "waist", to: "left_hip", color: "#06B6D4" },
      { from: "left_hip", to: "left_knee", color: "#3B82F6" },
      { from: "left_knee", to: "left_ankle", color: "#8B5CF6" },

      // 오른쪽 다리
      { from: "waist", to: "right_hip", color: "#10B981" },
      { from: "right_hip", to: "right_knee", color: "#3B82F6" },
      { from: "right_knee", to: "right_ankle", color: "#8B5CF6" },
    ];

    return { points, connections };
  }, [width]);

  // 포인트 찾기 (더 큰 클릭 영역)
  const findPoint = useCallback(
    (x: number, y: number, threshold: number = 25): SkeletonPoint | null => {
      return (
        pose.points.find((point) => {
          const distance = Math.sqrt((point.x - x) ** 2 + (point.y - y) ** 2);
          return distance <= threshold;
        }) || null
      );
    },
    [pose.points]
  );

  // 포인트 업데이트
  const updatePoint = useCallback(
    (pointId: string, x: number, y: number) => {
      const updatedPoints = pose.points.map((point) =>
        point.id === pointId ? { ...point, x, y } : point
      );
      onPoseChange({ ...pose, points: updatedPoints });
    },
    [pose, onPoseChange]
  );

  // 좌표 변환 함수 (CSS 크기 → 캔버스 크기)
  const getCanvasCoordinates = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }, []);

  // 마우스/터치 이벤트 핸들러
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const canvas = canvasRef.current;
      if (!canvas) return;

      const { x, y } = getCanvasCoordinates(e.clientX, e.clientY);
      const point = findPoint(x, y);

      if (point) {
        setSelectedPoint(point.id);
        setIsDragging(true);
        canvas.setPointerCapture(e.pointerId);
      }
    },
    [findPoint, getCanvasCoordinates]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDragging || !selectedPoint) return;

      const { x, y } = getCanvasCoordinates(e.clientX, e.clientY);
      const clampedX = Math.max(15, Math.min(width - 15, x));
      const clampedY = Math.max(15, Math.min(height - 15, y));

      updatePoint(selectedPoint, clampedX, clampedY);
    },
    [isDragging, selectedPoint, width, height, updatePoint, getCanvasCoordinates]
  );

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.releasePointerCapture(e.pointerId);
    }
    setIsDragging(false);
    setSelectedPoint(null);
  }, []);

  // 주어진 컨텍스트에 스켈레톤을 그림
  const drawToContext = useCallback((ctx: CanvasRenderingContext2D, backgroundColor: string) => {
    // 초기화 및 배경
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // 연결선
    pose.connections.forEach((connection) => {
      const fromPoint = pose.points.find((p) => p.id === connection.from);
      const toPoint = pose.points.find((p) => p.id === connection.to);
      if (fromPoint && toPoint) {
        ctx.strokeStyle = connection.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(fromPoint.x, fromPoint.y);
        ctx.lineTo(toPoint.x, toPoint.y);
        ctx.stroke();
      }
    });

    // 포인트
    pose.points.forEach((point) => {
      const isSelected = point.id === selectedPoint;
      const radius = isSelected ? 12 : 10;
      ctx.fillStyle = point.color;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = isSelected ? "#FFFFFF" : "#000000";
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.stroke();
      if (!isSelected) {
        ctx.strokeStyle = point.color;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius + 5, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    });
  }, [pose, selectedPoint, width, height]);

  // 실제 화면 캔버스 그리기
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawToContext(ctx, "#1D1F33");
  }, [drawToContext]);

  // 초기화 및 그리기
  useEffect(() => {
    if (!pose.points.length) {
      const defaultPose = createDefaultPose();
      onPoseChange(defaultPose);
    } else {
      drawCanvas();
    }
  }, [pose, createDefaultPose, onPoseChange, drawCanvas]);

  // 외부에서 PNG Blob 추출할 수 있도록 ref API 제공
  useImperativeHandle(ref, () => ({
    toBlob: () =>
      new Promise<Blob>((resolve, reject) => {
        // 오프스크린 캔버스에 검정 배경으로 렌더링하여 내보냄 (화면 깜빡임 없음)
        try {
          const off = document.createElement('canvas');
          off.width = width;
          off.height = height;
          const offCtx = off.getContext('2d');
          if (!offCtx) {
            reject(new Error('Offscreen context not available'));
            return;
          }
          drawToContext(offCtx, "#000000");
          off.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Failed to export skeleton canvas"));
          }, "image/png");
        } catch (e) {
          reject(e);
        }
      }),
  }));

  return (
    <div className='w-full'>
      <div className='bg-transparent rounded-lg p-4'>
        <div className='flex justify-center'>
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className='border border-primary rounded cursor-crosshair touch-none'
            style={{
              width: `${width}px`,
              height: `${height}px`,
              maxWidth: "100%",
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          />
        </div>
        <p className='text-text-color text-xs mt-2 text-center opacity-80'>
          관절을 드래그하여 포즈를 조정하세요
        </p>
      </div>
    </div>
  );
}

const SkeletonCanvas = forwardRef<SkeletonCanvasHandle, SkeletonCanvasProps>(SkeletonCanvasImpl);

export default SkeletonCanvas;

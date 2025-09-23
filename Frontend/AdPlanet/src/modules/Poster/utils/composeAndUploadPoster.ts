import { savePosterToGroup, getPosterImage } from '../../../services/posterService';
import type { TextOverlay } from '../../../types/poster';

export interface ComposeOptions {
  groupId: number;
  posterId: number;
  overlays: TextOverlay[];
  effectiveCssImageWidthPx: number;
  effectiveCssImageHeightPx: number;
}

export async function composeAndUploadPoster({ groupId, posterId, overlays, effectiveCssImageWidthPx, effectiveCssImageHeightPx }: ComposeOptions): Promise<void> {
  const blob = await getPosterImage(posterId);
  const baseUrl = URL.createObjectURL(blob);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = baseUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context not available');

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const safeCssWidth = Math.max(1, Math.floor(effectiveCssImageWidthPx || 500));
    const safeCssHeight = Math.max(1, Math.floor(effectiveCssImageHeightPx || 500));
    // 보수적으로 가로/세로 스케일 중 큰 값을 사용해 작은 저장 현상 방지
    const ratioW = canvas.width / safeCssWidth;
    const ratioH = canvas.height / safeCssHeight;
    const scaleRatio = Math.max(ratioW, ratioH);
    overlays.forEach((t) => {
      const x = (t.x / 100) * canvas.width;
      const y = (t.y / 100) * canvas.height;
      const scaledFontSize = Math.max(10, t.fontSize * scaleRatio);
      ctx.font = `${t.fontWeight} ${scaledFontSize}px ${t.fontFamily}`;
      ctx.fillStyle = t.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      ctx.fillText(t.text, x, y);
    });

    const composedBlob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png');
    });
    const file = new File([composedBlob], 'image.png', { type: 'image/png' });
    await savePosterToGroup(groupId, file);
  } finally {
    URL.revokeObjectURL(baseUrl);
  }
}



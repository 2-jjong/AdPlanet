import html2canvas from 'html2canvas';
import { getPosterImage, savePosterToGroup } from '../../../services/posterService';

export interface ComposeOptions {
  groupId: number;
  posterId: number;
  posterElement: HTMLElement;
}

export async function composeAndUploadPoster({ groupId, posterId, posterElement }: ComposeOptions): Promise<void> {
  let localImageUrl: string | null = null;
  
  try {
    // 1. 서버에서 이미지 바이너리 가져오기 (CORS 우회)
    const imageBlob = await getPosterImage(posterId);
    
    if (!(imageBlob instanceof Blob)) {
      throw new Error(`getPosterImage가 Blob이 아닌 값을 반환했습니다: ${typeof imageBlob}`);
    }
    
    localImageUrl = URL.createObjectURL(imageBlob);
    
    // 2. DOM의 이미지 src를 로컬 Blob URL로 임시 변경
    const imgElement = posterElement.querySelector('img') as HTMLImageElement | null;
    const originalSrc = imgElement?.src;
    
    if (imgElement) {
      imgElement.src = localImageUrl;
      
      // 이미지 로드 대기
      await new Promise((resolve, reject) => {
        if (imgElement.complete) {
          resolve(void 0);
        } else {
          imgElement.onload = () => resolve(void 0);
          imgElement.onerror = reject;
        }
      });
    }

    // 3. HTML2Canvas로 DOM 캡처 (이제 CORS 문제 없음)
    const canvas = await html2canvas(posterElement, {
      useCORS: false, // 로컬 이미지이므로 false
      allowTaint: false,
      logging: false,
      width: posterElement.offsetWidth,
      height: posterElement.offsetHeight,
    });

    // 4. 원본 이미지 src 복원
    if (imgElement && originalSrc) {
      imgElement.src = originalSrc;
    }

    // 5. 캔버스를 Blob으로 변환
    const composedBlob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob((b: Blob | null) => {
        if (b) {
          resolve(b);
        } else {
          reject(new Error('toBlob failed'));
        }
      }, 'image/png', 0.95);
    });

    // 6. 파일 생성 및 업로드
    const file = new File([composedBlob], 'poster.png', { type: 'image/png' });
    await savePosterToGroup(groupId, file);
    
  } catch (error) {
    console.error('Compose and upload error:', error);
    throw error;
  } finally {
    // 7. 로컬 Blob URL 정리
    if (localImageUrl) {
      URL.revokeObjectURL(localImageUrl);
    }
  }
}
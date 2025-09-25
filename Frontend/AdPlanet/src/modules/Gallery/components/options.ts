// src/modules/Gallery/options.ts
// 모든 옵션 한 곳에서 관리
import * as THREE from "three/src/Three.js"

/** 카드 크기/모양 */
export const CARD_W = 5.5;        // 카드 가로
export const CARD_H = 3;        // 카드 세로
export const CARD_D = 0.07;       // 카드 두께
export const CARD_RADIUS = 0.10;  // 카드 모서리 라운드
export const FEATHER_CORNER = Math.min(CARD_RADIUS / CARD_W, CARD_RADIUS / CARD_H); // 모서리 페더 비율

/** 배치/각도 */
export const DEFAULT_GAP   = 0.3;   // 카드 간격
export const DEFAULT_TILT  = -0.25;  // 카드 기울기
export const DEFAULT_DEPTH = -0.6; // z 간격(원근)

/** 프레임(유리) */
export const SHOW_FRAME = true;     // 프레임 노출 여부
export const GLASS_OPACITY   = 1; // 유리판 자체 투명도
export const GLASS_ROUGHNESS = 0.05;// 표면 거칠기
export const GLASS_THICKNESS = 0.05;// 굴절 두께
export const GLASS_IOR       = 1.35;// 굴절률 (카드 뒤쪽 두께 유리 느낌)

/** 텍스처 선명도 */
export const MAX_ANISOTROPY = 16;   // 비스듬히 볼 때 선명도(최대값으로 증가)

/** 스크롤 중심에서 멀수록 카드 전체 페이드 */
export const FADE_RADIUS = 5;       // 중심에서 몇 장까지 또렷하게 보일지
export const MIN_OPACITY = 0.95;    // 가장 바깥 카드 최소 불투명도

/** 렌더러 공용 설정 */
export const OUTPUT_COLORSPACE = THREE.SRGBColorSpace;



/** 호버 인터랙션(정면화) */
export const HOVER_FLATTEN = 0.5;  // 0=변화없음, 1=완전 정면(rotY→0으로 보간) - 더 자연스럽게
export const HOVER_SCALE   = 1.15; // 호버 시 확대 비율 - 살짝 더 크게
export const HOVER_DAMP    = 8;    // 감쇠(반응 속도) — 높을수록 빨리 수렴
export const HOVER_LIFT    = 0.1;  // 호버 시 Y축 상승 효과
export const HOVER_PULL    = 2.0; // 호버 시 X축 이동 (책을 뽑는 효과)

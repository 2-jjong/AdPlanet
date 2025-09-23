// src/modules/Gallery/options.ts
// 모든 옵션 한 곳에서 관리
import * as THREE from "three";

/** 카드 크기/모양 */
export const CARD_W = 3.2;        // 카드 가로
export const CARD_H = 4.8;        // 카드 세로
export const CARD_D = 0.06;       // 카드 두께(유리 프레임)
export const CARD_RADIUS = 0.12;  // 카드 모서리 라운드

/** 배치/각도 */
export const DEFAULT_GAP   = 3.2;   // 카드 간격(좌→우)
export const DEFAULT_TILT  = -0.35; // 카드 기울기(좌하→우상 사선)
export const DEFAULT_DEPTH = -0.45; // z 간격(원근)

/** 프레임(유리) — 사진 선명도엔 영향 없음 */
export const SHOW_FRAME = true;     // 프레임 노출 여부
export const GLASS_OPACITY   = 1;   // 유리판 자체 투명도 (PBR 기준, transmission과 함께 사용)
export const GLASS_ROUGHNESS = 0.08;// 표면 거칠기
export const GLASS_THICKNESS = 0.03;// 굴절 두께
export const GLASS_IOR       = 1.04;// 굴절률(1.0~1.2)

/** 텍스처 선명도 */
export const MAX_ANISOTROPY = 8;    // 비스듬히 볼 때 선명도(2~16)

/** 스크롤 중심에서 멀수록 카드 전체 페이드 */
export const FADE_RADIUS = 4;       // 중심에서 ±몇 장까지 또렷
export const MIN_OPACITY = 0.22;    // 가장 바깥 카드 최소 불투명도

/** 사진 “테두리 블러” (프레임 X, 사진 그 자체만) */
export const EDGE_BLUR_INNER    = 0.60; // 블러 시작 반경(작을수록 중앙부터)
export const EDGE_BLUR_OUTER    = 0.92; // 블러 최대 반경(클수록 테두리에서만)
export const EDGE_BLUR_POWER    = 1.35; // 마스크 곡선(커질수록 중앙 덜, 테두리 급격)
export const EDGE_BLUR_PX       = 5.0;  // 블러 반경(px, 텍스처 해상도 기준)
export const EDGE_BLUR_STRENGTH = 1.0;  // 블러 섞는 비율(0~1)

/** 렌더러 공용 설정 */
export const OUTPUT_COLORSPACE = THREE.SRGBColorSpace;

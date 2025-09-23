// src/modules/Gallery/options.ts
// 모든 옵션 한 곳에서 관리
import * as THREE from "three/src/Three.js"

/** 카드 크기/모양 */
export const CARD_W = 3.2;        // 카드 가로
export const CARD_H = 4.8;        // 카드 세로
export const CARD_D = 0.06;       // 카드 두께(유리 프레임)
export const CARD_RADIUS = 0.10;  // 카드 모서리 라운드
export const FEATHER_CORNER = Math.min(CARD_RADIUS / CARD_W, CARD_RADIUS / CARD_H); // 모서리 페더 비율

/** 배치/각도 */
export const DEFAULT_GAP   = 3.2;   // 카드 간격(좌→우)
export const DEFAULT_TILT  = -0.35; // 카드 기울기(좌하→우상 사선)
export const DEFAULT_DEPTH = -0.45; // z 간격(원근)

/** 프레임(유리) */
export const SHOW_FRAME = true;     // 프레임 노출 여부
export const GLASS_OPACITY   = 1;   // 유리판 자체 투명도 (PBR 기준, transmission과 함께 사용)
export const GLASS_ROUGHNESS = 0.08;// 표면 거칠기
export const GLASS_THICKNESS = 0.03;// 굴절 두께
export const GLASS_IOR       = 1.2;// 굴절률(1.0~1.2)

/** 텍스처 선명도 */
export const MAX_ANISOTROPY = 8;    // 비스듬히 볼 때 선명도(2~16)

/** 스크롤 중심에서 멀수록 카드 전체 페이드 */
export const FADE_RADIUS = 4;       // 중심에서 ±몇 장까지 또렷
export const MIN_OPACITY = 0.4;    // 가장 바깥 카드 최소 불투명도

/** 렌더러 공용 설정 */
export const OUTPUT_COLORSPACE = THREE.SRGBColorSpace;

/** 카드 뒷배경(포스터 뒤에 깔리는 얇은 판) */
export const SHOW_BACKPLATE   = true;           // 배경판 노출 여부
export const BACKPLATE_INSET  = 0.05;           // 프레임 안쪽 여백(양쪽 합의 절반) — 값↑ = 더 작게
export const BACKPLATE_COLOR  = "#dfdfdfff";      // 중성 회색(언릿)
export const BACKPLATE_OPACITY= 1.0;            // 배경판 불투명도(0~1)
export const BACKPLATE_ROUND  = 0.10;           // 배경판 모서리 라운드(프레임보다 살짝 작게)
export const BACKPLATE_THICK  = 0.002;          // 두께(아주 얇게)

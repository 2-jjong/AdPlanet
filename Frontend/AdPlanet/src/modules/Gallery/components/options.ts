// src/modules/Gallery/options.ts
// 모든 옵션 한 곳에서 관리
import * as THREE from "three/src/Three.js"

/** 카드 크기/모양 */
export const CARD_W = 2.3;        // 카드 가로 (더 작게 조정)
export const CARD_H = 2.8;        // 카드 세로 (더 작게 조정)
export const CARD_D = 0.07;       // 카드 두께(유리 프레임)
export const CARD_RADIUS = 0.10;  // 카드 모서리 라운드
export const FEATHER_CORNER = Math.min(CARD_RADIUS / CARD_W, CARD_RADIUS / CARD_H); // 모서리 페더 비율

/** 배치/각도 */
export const DEFAULT_GAP   = 2.4;   // 카드 간격(좌→우) - 카드 크기에 맞춰 조정
export const DEFAULT_TILT  = -0.6;  // 카드 기울기(좌상→우하 사선) - 더 세련된 좌측 틸팅
export const DEFAULT_DEPTH = -0.25; // z 간격(원근) - 카드가 작아진 만큼 조정

/** 프레임(유리) */
export const SHOW_FRAME = true;     // 프레임 노출 여부
export const GLASS_OPACITY   = 0.7; // 유리판 자체 투명도 (더 투명하게)
export const GLASS_ROUGHNESS = 0.05;// 표면 거칠기 (더 매끄럽게)
export const GLASS_THICKNESS = 0.05;// 굴절 두께 (더 두껍게 해서 유리감 향상)
export const GLASS_IOR       = 1.45;// 굴절률 (유리에 더 가깝게)

/** 텍스처 선명도 */
export const MAX_ANISOTROPY = 16;   // 비스듬히 볼 때 선명도(최대값으로 증가)

/** 스크롤 중심에서 멀수록 카드 전체 페이드 */
export const FADE_RADIUS = 5;       // 중심에서 ±몇 장까지 또렷 (더 집중적인 효과)
export const MIN_OPACITY = 0.6;    // 가장 바깥 카드 최소 불투명도 (더 강한 페이드)

/** 렌더러 공용 설정 */
export const OUTPUT_COLORSPACE = THREE.SRGBColorSpace;

/** 카드 뒷배경(포스터 뒤에 깔리는 얇은 판) */
export const SHOW_BACKPLATE   = true;           // 배경판 노출 여부
export const BACKPLATE_INSET  = 0.05;           // 프레임 안쪽 여백(양쪽 합의 절반) — 값↑ = 더 작게
export const BACKPLATE_COLOR  = "#dfdfdfff";      // 중성 회색(언릿)
export const BACKPLATE_OPACITY= 1.0;            // 배경판 불투명도(0~1)
export const BACKPLATE_ROUND  = 0.05;           // 배경판 모서리 라운드(프레임보다 살짝 작게)
export const BACKPLATE_THICK  = 0.002;          // 두께(아주 얇게)

/** 호버 인터랙션(정면화) */
export const HOVER_FLATTEN = 0.7;  // 0=변화없음, 1=완전 정면(rotY→0으로 보간) - 더 자연스럽게
export const HOVER_SCALE   = 1.15; // 호버 시 확대 비율 - 살짝 더 크게
export const HOVER_DAMP    = 8;    // 감쇠(반응 속도) — 높을수록 빨리 수렴
export const HOVER_LIFT    = 0.1;  // 호버 시 Y축 상승 효과

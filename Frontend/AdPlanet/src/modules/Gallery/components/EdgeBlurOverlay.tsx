// src/modules/Gallery3D/EdgeBlurOverlay.tsx
// 사진 "테두리 투명(페더 알파)" 전용 머티리얼
// - 블러 없음, 색 왜곡 방지를 위해 sRGB↔Linear를 셰이더에서 직접 처리
// - three r1xx 버전차로 생기는 #include 의존성 제거 (안전)

import * as THREE from "three/src/Three.js"
import { useEffect, useMemo, useRef } from "react";


export type EdgeBlurProps = {
  map: THREE.Texture;   // 원본 텍스처
  inner: number;        // 투명 시작 (0~1) — 경계에서 중앙 방향으로의 정규화 거리
  outer: number;        // 투명 종료 (0~1) — inner < outer
  power: number;        // 곡선 강도 — 클수록 가장자리에서 급히 사라짐
  opacity: number;      // 전역 알파(스크롤 페이드와 곱)
  corner?: number;      // 모서리 둥글기 (0~1, 0=직각)
  shrink?: number;      // 경계 수축(0~0.49) — 0.006~0.010 정도 권장
  /** 값 변경 시 재질을 재생성하고 싶으면 키를 넘겨주세요(핫리로드/유니폼 꼬임 회피용) */
  materialKey?: string;
};

export default function EdgeBlurOverlay({
  map, inner, outer, power, opacity, corner = 0, shrink = 0, materialKey,
}: EdgeBlurProps) {
  const mat = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(() => ({
    uMap:     { value: map },
    uInner:   { value: inner },
    uOuter:   { value: outer },
    uPower:   { value: power },
    uOpacity: { value: opacity },
    uCorner:  { value: corner },
    uShrink:  { value: shrink },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [map]);

  // prop → 유니폼 실시간 반영
  useEffect(() => { if (mat.current) mat.current.uniforms.uInner.value   = inner;   }, [inner]);
  useEffect(() => { if (mat.current) mat.current.uniforms.uOuter.value   = outer;   }, [outer]);
  useEffect(() => { if (mat.current) mat.current.uniforms.uPower.value   = power;   }, [power]);
  useEffect(() => { if (mat.current) mat.current.uniforms.uOpacity.value = opacity; }, [opacity]);
  useEffect(() => { if (mat.current) mat.current.uniforms.uCorner.value  = corner;  }, [corner]);
  useEffect(() => { if (mat.current) mat.current.uniforms.uShrink.value  = shrink;  }, [shrink]);

  return (
    <shaderMaterial
      key={materialKey}
      ref={mat}
      attach="material"   // 이 메시에 '단독' 재질로 붙임
      transparent
      depthWrite={false}
      toneMapped={false}  // 색 변환 없음(텍스처는 Linear로 취급 권장)
      uniforms={uniforms}
      vertexShader={/* glsl */`
        varying vec2 vUv;
        void main(){
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `}
      fragmentShader={/* glsl */`
        varying vec2 vUv;
        uniform sampler2D uMap;
        uniform float uInner;
        uniform float uOuter;
        uniform float uPower;
        uniform float uOpacity;
        uniform float uCorner; // 0~1
        uniform float uShrink; // 0~0.49 (uv 단위)

        // 사각형 SDF (직각)
        float sdBox(vec2 p, vec2 b){
          vec2 d = abs(p) - b;
          return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
        }
        // 라운드 사각형 SDF
        float sdRoundedBox(vec2 p, vec2 b, float r){
          vec2 q = abs(p) - (b - vec2(r));
          return length(max(q, 0.0)) - r;
        }

        void main(){
          // 1) 원본 샘플 (색 변환 없음; 캔버스/텍스처 세팅으로 일치시킴)
          vec4 src = texture2D(uMap, vUv);

          // 2) 중앙 기준 좌표(-0.5~+0.5)
          vec2 p = vUv - 0.5;

          // 3) halfSize: 경계에서 uShrink 만큼 안쪽으로 수축
          float s = clamp(uShrink, 0.0, 0.49);
          vec2 halfSize = vec2(0.5 - s);

          // 4) 라운드 반경(uv 단위) — corner를 halfSize에 맞춰 클램프
          float cr = clamp(uCorner, 0.0, 1.0) * 0.5;
          cr = min(cr, min(halfSize.x, halfSize.y));
          cr = max(cr, 0.0);

          // 5) 박스 경계까지의 signed distance (안쪽 음수)
          float sd = (cr > 0.0)
            ? sdRoundedBox(p, halfSize, cr)
            : sdBox(p, halfSize);

          // 6) 경계→중앙 정규화 거리 r: 0=경계, 1=중앙
          float maxDist = max(1e-6, min(halfSize.x, halfSize.y) - cr);
          float r = clamp((-sd) / maxDist, 0.0, 1.0);

          // 7) 가장자리 마스크 m: 중앙 0 → 테두리 1
          float m = smoothstep(uInner, uOuter, r);
          m = pow(m, uPower);

          // 8) 색은 그대로, 알파만 테두리로 갈수록 0
          float alpha = (1.0 - m) * uOpacity * src.a;
          if (alpha <= 0.001) discard;

          gl_FragColor = vec4(src.rgb, alpha);
        }
      `}
    />
  );
}
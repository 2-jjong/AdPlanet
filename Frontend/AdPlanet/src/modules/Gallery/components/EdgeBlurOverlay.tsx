// src/modules/Gallery3D/EdgeBlurOverlay.tsx
// 사진 "테두리 투명(페더 알파)" 전용 머티리얼
// - 블러 없음, 색 왜곡 방지를 위해 sRGB↔Linear를 셰이더에서 직접 처리
// - three r1xx 버전차로 생기는 #include 의존성 제거 (안전)

import * as THREE from "three/src/Three.js"
import { useEffect, useMemo, useRef } from "react";

export type EdgeBlurProps = {
  map: THREE.Texture;   // 원본 텍스처
  inner: number;        // 투명 시작 반경(0~1, 작을수록 중앙부터 사라짐)
  outer: number;        // 투명 최대 반경(0~1, 1이면 테두리에서만 사라짐)
  power: number;        // 그라데이션 곡선(커질수록 중앙 덜, 테두리 급격)
  opacity: number;      // 전역 알파(스크롤 페이드와 곱해 사용)
  aspect: number;       // 가로/세로 비(= width / height)
};

export default function EdgeBlurOverlay({
  map, inner, outer, power, opacity, aspect,
}: EdgeBlurProps) {
  const mat = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(() => ({
    uMap:     { value: map },
    uInner:   { value: inner },
    uOuter:   { value: outer },
    uPower:   { value: power },
    uOpacity: { value: opacity },
    uAspect:  { value: aspect }, // width / height
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [map]);

  // prop 변경 시 유니폼 갱신
  useEffect(() => { if (mat.current) mat.current.uniforms.uInner.value   = inner;   }, [inner]);
  useEffect(() => { if (mat.current) mat.current.uniforms.uOuter.value   = outer;   }, [outer]);
  useEffect(() => { if (mat.current) mat.current.uniforms.uPower.value   = power;   }, [power]);
  useEffect(() => { if (mat.current) mat.current.uniforms.uOpacity.value = opacity; }, [opacity]);
  useEffect(() => { if (mat.current) mat.current.uniforms.uAspect.value  = aspect;  }, [aspect]);

  return (
    <shaderMaterial
      ref={mat}
      attach="material"     // ✔ 이 메시에 '단독' 재질로 붙임
      transparent
      depthWrite={false}
      toneMapped={false}    // ✔ 셰이더에서 색 변환 안 하므로 톤매핑 비활성화
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
        uniform float uInner;    // 투명 시작 반경
        uniform float uOuter;    // 투명 끝   반경
        uniform float uPower;    // 곡선
        uniform float uOpacity;  // 전역 알파
        uniform float uAspect;   // width/height

        void main(){
          // 1) 텍스처 샘플(색 변환 없음) — 텍스처는 Linear로 취급됨
          vec4 src = texture2D(uMap, vUv);

          // 2) 중심 기준 타원 거리(가로/세로 보정 + 안전 클램프)
          vec2 p = vUv - 0.5;
          float a = max(uAspect, 1e-6);
          vec2 q = p;
          if (a < 1.0) q.x /= a;  // 세로가 긴 카드: x 늘림
          else          q.y *= a; // 가로가 긴 카드: y 늘림

          // 3) 가장자리 마스크: 중앙 0 → 테두리 1
          float r = length(q) * 1.41421356; // 코너까지 ~1
          float m = clamp((r - uInner) / max(1e-6, (uOuter - uInner)), 0.0, 1.0);
          m = pow(m, uPower);

          // 4) 색은 그대로, 알파만 테두리로 갈수록 0
          float alpha = (1.0 - m) * uOpacity * src.a;
          if (alpha <= 0.001) discard;

          gl_FragColor = vec4(src.rgb, alpha);
        }
      `}
    />
  );
}

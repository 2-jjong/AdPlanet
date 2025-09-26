// src/modules/Gallery3D/EdgeBlurOverlay.tsx
// 카드 모서리 블러 오버레이 컴포넌트
// 3D 모델의 표면에 2D 이미지(텍스처)를 매핑

import * as THREE from "three/src/Three.js"
import { useEffect, useMemo, useRef } from "react";

export type EdgeBlurProps = {
  map: THREE.Texture;
  inner: number;
  outer: number;
  power: number;
  opacity: number;
  corner?: number;
  shrink?: number;
  uvScale?: [number, number];   // 텍스처 UV 스케일(cover 용)
  uvOffset?: [number, number];  // 텍스처 UV 오프셋(cover 용)
  materialKey?: string;
};

export default function EdgeBlurOverlay({
  map, inner, outer, power, opacity, corner = 0, shrink = 0,
  uvScale = [1, 1], uvOffset = [0, 0], materialKey,
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
    uUVScale: { value: new THREE.Vector2(...uvScale) },
    uUVOffset:{ value: new THREE.Vector2(...uvOffset) },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [map]);

  useEffect(() => { if (mat.current) mat.current.uniforms.uInner.value   = inner;   }, [inner]);
  useEffect(() => { if (mat.current) mat.current.uniforms.uOuter.value   = outer;   }, [outer]);
  useEffect(() => { if (mat.current) mat.current.uniforms.uPower.value   = power;   }, [power]);
  useEffect(() => { if (mat.current) mat.current.uniforms.uOpacity.value = opacity; }, [opacity]);
  useEffect(() => { if (mat.current) mat.current.uniforms.uCorner.value  = corner;  }, [corner]);
  useEffect(() => { if (mat.current) mat.current.uniforms.uShrink.value  = shrink;  }, [shrink]);
  useEffect(() => { if (mat.current) mat.current.uniforms.uUVScale.value .set(...uvScale); }, [uvScale]);
  useEffect(() => { if (mat.current) mat.current.uniforms.uUVOffset.value.set(...uvOffset);}, [uvOffset]);

  return (
    <shaderMaterial
      key={materialKey}
      ref={mat}
      attach="material"
      transparent
      depthWrite={false}
      toneMapped={false}
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
        uniform float uInner, uOuter, uPower, uOpacity, uCorner, uShrink;
        uniform vec2  uUVScale, uUVOffset;

        float sdBox(vec2 p, vec2 b){
          vec2 d = abs(p) - b;
          return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
        }
        float sdRoundedBox(vec2 p, vec2 b, float r){
          vec2 q = abs(p) - (b - vec2(r));
          return length(max(q, 0.0)) - r;
        }

        void main(){
          // --- 0) object-fit: cover 를 위한 UV 변환 ---
          vec2 uv = vUv * uUVScale + uUVOffset;

          // 1) 텍스처 샘플 (바깥은 테두리 알파로 사라지므로 굳이 discard 안 함)
          vec4 src = texture2D(uMap, uv);

          // 2) 중앙 기준 좌표(-0.5~+0.5)
          vec2 p = vUv - 0.5;

          float s = clamp(uShrink, 0.0, 0.49);
          vec2 halfSize = vec2(0.5 - s);

          float cr = clamp(uCorner, 0.0, 1.0) * 0.5;
          cr = min(cr, min(halfSize.x, halfSize.y));
          cr = max(cr, 0.0);

          float sd = (cr > 0.0)
            ? sdRoundedBox(p, halfSize, cr)
            : sdBox(p, halfSize);

          float maxDist = max(1e-6, min(halfSize.x, halfSize.y) - cr);
          float r = clamp((-sd) / maxDist, 0.0, 1.0);

          float m = smoothstep(uInner, uOuter, r);
          m = pow(m, uPower);

          float alpha = (1.0 - m) * uOpacity * src.a;
          if (alpha <= 0.001) discard;

          gl_FragColor = vec4(src.rgb, alpha);
        }
      `}
    />
  );
}

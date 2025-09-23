// src/modules/Gallery3D/EdgeBlurOverlay.tsx
import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";

export type EdgeBlurProps = {
  map: THREE.Texture;   // 원본 텍스처
  inner: number;        // 블러 시작 반경(0~1)
  outer: number;        // 블러 최대 반경(0~1)
  power: number;        // 마스크 커브
  blurPx: number;       // 블러 반경(px)
  strength: number;     // 블러 섞는 비율(0~1)
  opacity: number;      // 전역 알파(스크롤 페이드와 곱해 사용)
  aspect: number;       // 가로/세로 비(타원 보정)
};

export default function EdgeBlurOverlay({
  map, inner, outer, power, blurPx, strength, opacity, aspect,
}: EdgeBlurProps) {
  const mat = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(() => ({
    uMap:      { value: map },
    uTexel:    { value: new THREE.Vector2(1 / 1024, 1 / 1024) }, // 초기값(로드 후 갱신)
    uInner:    { value: inner },
    uOuter:    { value: outer },
    uPower:    { value: power },
    uBlurPx:   { value: blurPx },
    uStrength: { value: strength },
    uOpacity:  { value: opacity },
    uAspect:   { value: aspect },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [map]);

  // 텍스처 크기 로드 후 texel 갱신
  useEffect(() => {
    const updateTexel = () => {
      const img: any = (map as any).image;
      if (!img || !img.width) return;
      mat.current!.uniforms.uTexel.value.set(1 / img.width, 1 / img.height);
    };
    if ((map as any).image) updateTexel();
    (map as any).addEventListener?.("update", updateTexel);
    return () => (map as any).removeEventListener?.("update", updateTexel);
  }, [map]);

  // prop 변경 시 유니폼 갱신
  useEffect(() => { if (mat.current) mat.current.uniforms.uInner.value    = inner;    }, [inner]);
  useEffect(() => { if (mat.current) mat.current.uniforms.uOuter.value    = outer;    }, [outer]);
  useEffect(() => { if (mat.current) mat.current.uniforms.uPower.value    = power;    }, [power]);
  useEffect(() => { if (mat.current) mat.current.uniforms.uBlurPx.value   = blurPx;   }, [blurPx]);
  useEffect(() => { if (mat.current) mat.current.uniforms.uStrength.value = strength; }, [strength]);
  useEffect(() => { if (mat.current) mat.current.uniforms.uOpacity.value  = opacity;  }, [opacity]);
  useEffect(() => { if (mat.current) mat.current.uniforms.uAspect.value   = aspect;   }, [aspect]);

  return (
    <shaderMaterial
      ref={mat}
      transparent
      depthWrite={false}
      uniforms={uniforms}
      vertexShader={/* glsl */`
        varying vec2 vUv;
        void main(){
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        }
      `}
      fragmentShader={/* glsl */`
        varying vec2 vUv;
        uniform sampler2D uMap;
        uniform vec2  uTexel;    // 1px in UV
        uniform float uInner;    // 블러 시작 반경
        uniform float uOuter;    // 블러 최대 반경
        uniform float uPower;    // 마스크 커브
        uniform float uBlurPx;   // 블러 반경(px)
        uniform float uStrength; // 블러 섞는 비율
        uniform float uOpacity;  // 전역 알파
        uniform float uAspect;   // 타원 보정

        // 12탭 링 블러(가벼운 근사)
        vec4 ringBlur(sampler2D tex, vec2 uv, float px){
          vec2 t = uTexel * px;
          vec4 sum = texture2D(tex, uv);
          sum += texture2D(tex, uv + vec2( t.x, 0.0));
          sum += texture2D(tex, uv - vec2( t.x, 0.0));
          sum += texture2D(tex, uv + vec2( 0.0, t.y));
          sum += texture2D(tex, uv - vec2( 0.0, t.y));
          sum += texture2D(tex, uv + vec2( 2.0*t.x, 0.0));
          sum += texture2D(tex, uv - vec2( 2.0*t.x, 0.0));
          sum += texture2D(tex, uv + vec2( 0.0, 2.0*t.y));
          sum += texture2D(tex, uv - vec2( 0.0, 2.0*t.y));
          vec2 d = t * 0.7071;
          sum += texture2D(tex, uv + vec2( d.x,  d.y));
          sum += texture2D(tex, uv + vec2(-d.x,  d.y));
          sum += texture2D(tex, uv + vec2( d.x, -d.y));
          sum += texture2D(tex, uv + vec2(-d.x, -d.y));
          return sum / 13.0;
        }

        void main(){
          vec4 src = texture2D(uMap, vUv);

          // 중심 기준 타원 거리(가로/세로 보정)
          vec2 p = vUv - 0.5;
          p.x *= uAspect;
          float r = length(p); // 0(중앙) ~ 1(모서리)

          // 가장자리 마스크 m: 중앙 0 → 테두리 1
          float m = smoothstep(uInner, uOuter, r);
          m = pow(m, uPower);

          // 테두리일수록 블러 반경 증가
          float px = uBlurPx * m;

          vec4 blurred = ringBlur(uMap, vUv, px);
          vec3 color = mix(src.rgb, blurred.rgb, m * uStrength);

          gl_FragColor = vec4(color, src.a * uOpacity);
        }
      `}
    />
  );
}

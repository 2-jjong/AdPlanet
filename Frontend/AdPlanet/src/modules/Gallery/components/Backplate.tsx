// src/modules/Gallery3D/Backplate.tsx
import { RoundedBox } from "@react-three/drei";
import {
  CARD_W, CARD_H, BACKPLATE_INSET, BACKPLATE_COLOR, BACKPLATE_OPACITY,
  BACKPLATE_ROUND, BACKPLATE_THICK,
} from "./options";

type Props = { renderOrder?: number };

export default function Backplate({ renderOrder = 0 }: Props) { // ← 낮은 값(먼저 그림)
  const w = Math.max(0.001, CARD_W - BACKPLATE_INSET * 2);
  const h = Math.max(0.001, CARD_H - BACKPLATE_INSET * 2);
  const r = Math.max(0, BACKPLATE_ROUND);

  const isTransparent = BACKPLATE_OPACITY < 1; // 1이면 '불투명' 패스로 보내기

  return (
    <RoundedBox args={[w, h, BACKPLATE_THICK]} radius={r} smoothness={4} renderOrder={renderOrder}>
      <meshBasicMaterial
        color={BACKPLATE_COLOR}
        opacity={BACKPLATE_OPACITY}
        transparent={isTransparent}
        depthTest={true}
        depthWrite={!isTransparent}     // 불투명일 때만 깊이 기록
        polygonOffset                   // 경계에서 z-fighting 방지
        polygonOffsetFactor={1}
        polygonOffsetUnits={1}
      />
    </RoundedBox>
  );
}

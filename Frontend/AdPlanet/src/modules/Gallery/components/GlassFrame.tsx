// src/modules/Gallery3D/GlassFrame.tsx
// 유리 프레임

import { RoundedBox } from "@react-three/drei";
import { CARD_D, CARD_RADIUS, GLASS_IOR, GLASS_OPACITY, GLASS_ROUGHNESS, GLASS_THICKNESS } from "./options";

type Props = {
  width?: number;
  height?: number;
};

export default function GlassFrame({ width = 5.5, height = 3 }: Props) {
  return (
    <RoundedBox args={[width, height, CARD_D]} radius={CARD_RADIUS} smoothness={4} renderOrder={1}>
      <meshPhysicalMaterial
        transparent
        opacity={GLASS_OPACITY}
        roughness={GLASS_ROUGHNESS}
        metalness={0}
        transmission={1}
        thickness={GLASS_THICKNESS}
        ior={GLASS_IOR}
        clearcoat={0.4}
        clearcoatRoughness={0.25}
        envMapIntensity={0.9}
      />
    </RoundedBox>
  );
}

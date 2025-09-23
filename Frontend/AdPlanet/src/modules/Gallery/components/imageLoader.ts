// src/modules/Gallery3D/imageLoader.ts
// 기본 이미지 자동 로딩 
const modules = import.meta.glob("/src/assets/gallery/*.{jpg,jpeg,png,webp,avif}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

export const DEFAULT_IMAGES: string[] = Object.entries(modules)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([, url]) => url);

import apiClient from "../services/apiClient";


/* ─────────────────────────────────────────────────────────────
   공통 유틸
───────────────────────────────────────────────────────────── */
const ok = (code?: string) => code === "S0000";

/** 절대 URL로 변환 (이미 절대면 그대로, 빈값이면 빈값, 상대면 baseURL 기준으로 절대) */
export const toAbsolute = (p: string) => {
  if (!p || /^https?:\/\//i.test(p)) return p;
  const base = (apiClient as any)?.defaults?.baseURL || "";
  return base ? new URL(p.startsWith("/") ? p : `/${p}`, base).toString() : p;
};

const splitToList = (s?: string): string[] =>
  (s ?? "")
    .split(/\r?\n|[;|]|,/) // 줄바꿈, 세미콜론, |, 쉼표 단위 분해
    .map(v => v.trim())
    .filter(Boolean);

const parseMinSize = (s?: string): { mm?: number; px?: number } => {
  if (!s) return {};
  const mm = s.match(/([\d.]+)\s*mm/i)?.[1];
  const px = s.match(/([\d.]+)\s*px/i)?.[1];
  return {
    mm: mm ? Number(mm) : undefined,
    px: px ? Number(px) : undefined,
  };
};

type ColorSpecDto = { color?: string; guide?: string; label: string };
const parseColorSpec = ({ color, guide, label }: ColorSpecDto) => {
  // color가 "Sky Blue #00AAFF" 혹은 "#00AAFF" 등일 수 있으니 둘 다 처리
  const hexMatch = color?.match(/#[0-9a-f]{6}/i)?.[0];
  const name =
    color && hexMatch ? color.replace(hexMatch, "").trim() || label : label;
  const hex = hexMatch ?? (color && /^#[0-9a-f]{6}$/i.test(color) ? color : undefined);
  return { name, hex, guide };
};
